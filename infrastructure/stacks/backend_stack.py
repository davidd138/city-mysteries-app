import os
import aws_cdk as cdk
from constructs import Construct
from aws_cdk import (
    aws_cognito as cognito,
    aws_dynamodb as dynamodb,
    aws_appsync as appsync,
    aws_lambda as _lambda,
    aws_iam as iam,
    aws_secretsmanager as secretsmanager,
    aws_wafv2 as wafv2,
)


class BackendStack(cdk.Stack):
    def __init__(self, scope: Construct, construct_id: str, env_name: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # ---- Pre-signup Lambda ----
        pre_signup_fn = _lambda.Function(
            self, "PreSignupFn",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="pre_signup.handler",
            code=_lambda.Code.from_asset(
                os.path.join(os.path.dirname(__file__), "..", "..", "backend", "lambdas", "triggers")
            ),
            function_name=f"{env_name}-cm-pre-signup",
        )

        # ---- Cognito ----
        user_pool = cognito.UserPool(
            self, "UserPool",
            user_pool_name=f"{env_name}-cm-users",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_lowercase=True,
                require_uppercase=True,
                require_digits=True,
            ),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=True),
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            lambda_triggers=cognito.UserPoolTriggers(
                pre_sign_up=pre_signup_fn,
            ),
        )

        user_pool_client = user_pool.add_client(
            "AppClient",
            user_pool_client_name=f"{env_name}-cm-app-client",
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True,
            ),
        )

        # ---- DynamoDB Tables ----
        users_table = dynamodb.Table(
            self, "UsersTable",
            table_name=f"{env_name}-cm-users",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )
        users_table.add_global_secondary_index(
            index_name="email-index",
            partition_key=dynamodb.Attribute(name="email", type=dynamodb.AttributeType.STRING),
        )

        mysteries_table = dynamodb.Table(
            self, "MysteriesTable",
            table_name=f"{env_name}-cm-mysteries",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )

        characters_table = dynamodb.Table(
            self, "CharactersTable",
            table_name=f"{env_name}-cm-characters",
            partition_key=dynamodb.Attribute(name="mysteryId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="characterId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )

        game_sessions_table = dynamodb.Table(
            self, "GameSessionsTable",
            table_name=f"{env_name}-cm-game-sessions",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )
        game_sessions_table.add_global_secondary_index(
            index_name="userId-createdAt-index",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="startedAt", type=dynamodb.AttributeType.STRING),
        )

        interactions_table = dynamodb.Table(
            self, "InteractionsTable",
            table_name=f"{env_name}-cm-interactions",
            partition_key=dynamodb.Attribute(name="sessionId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="characterId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )

        # ---- Secrets Manager ----
        # Reference existing OpenAI secret (shared with sales-training-app)
        openai_secret = secretsmanager.Secret.from_secret_name_v2(
            self, "OpenAISecret",
            secret_name=f"{env_name}/openai-api-key",
        )

        mapbox_secret = secretsmanager.Secret(
            self, "MapboxSecret",
            secret_name=f"{env_name}/mapbox-api-key",
            description="Mapbox API Key for map rendering",
        )

        # ---- AppSync ----
        api = appsync.GraphqlApi(
            self, "Api",
            name=f"{env_name}-cm-api",
            definition=appsync.Definition.from_file(
                os.path.join(os.path.dirname(__file__), "..", "..", "backend", "schema", "schema.graphql")
            ),
            authorization_config=appsync.AuthorizationConfig(
                default_authorization=appsync.AuthorizationMode(
                    authorization_type=appsync.AuthorizationType.USER_POOL,
                    user_pool_config=appsync.UserPoolConfig(user_pool=user_pool),
                ),
            ),
        )

        # ---- WAF ----
        waf_acl = wafv2.CfnWebACL(
            self, "ApiWaf",
            scope="REGIONAL",
            default_action=wafv2.CfnWebACL.DefaultActionProperty(allow={}),
            visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                sampled_requests_enabled=True,
                cloud_watch_metrics_enabled=True,
                metric_name=f"{env_name}-cm-api-waf",
            ),
            rules=[
                wafv2.CfnWebACL.RuleProperty(
                    name="RateLimit",
                    priority=1,
                    action=wafv2.CfnWebACL.RuleActionProperty(block={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        rate_based_statement=wafv2.CfnWebACL.RateBasedStatementProperty(
                            limit=1000,
                            aggregate_key_type="IP",
                        ),
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        sampled_requests_enabled=True,
                        cloud_watch_metrics_enabled=True,
                        metric_name=f"{env_name}-cm-rate-limit",
                    ),
                ),
                wafv2.CfnWebACL.RuleProperty(
                    name="AWSCommonRules",
                    priority=2,
                    override_action=wafv2.CfnWebACL.OverrideActionProperty(none={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        managed_rule_group_statement=wafv2.CfnWebACL.ManagedRuleGroupStatementProperty(
                            vendor_name="AWS",
                            name="AWSManagedRulesCommonRuleSet",
                        ),
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        sampled_requests_enabled=True,
                        cloud_watch_metrics_enabled=True,
                        metric_name=f"{env_name}-cm-common-rules",
                    ),
                ),
            ],
        )

        wafv2.CfnWebACLAssociation(
            self, "ApiWafAssociation",
            resource_arn=api.arn,
            web_acl_arn=waf_acl.attr_arn,
        )

        # ---- Common Lambda environment ----
        common_env = {
            "USERS_TABLE": users_table.table_name,
            "MYSTERIES_TABLE": mysteries_table.table_name,
            "CHARACTERS_TABLE": characters_table.table_name,
            "GAME_SESSIONS_TABLE": game_sessions_table.table_name,
            "INTERACTIONS_TABLE": interactions_table.table_name,
            "ENV_NAME": env_name,
        }

        tables = {
            "users": users_table,
            "mysteries": mysteries_table,
            "characters": characters_table,
            "game_sessions": game_sessions_table,
            "interactions": interactions_table,
        }

        # ---- Helper to create Lambda + AppSync resolver ----
        def create_resolver(
            name: str, type_name: str, field_name: str,
            read_tables: list[str] | None = None,
            write_tables: list[str] | None = None,
            extra_env=None, timeout=30, memory=256,
        ):
            env = {**common_env, **(extra_env or {})}
            fn = _lambda.Function(
                self, f"{name}Fn",
                runtime=_lambda.Runtime.PYTHON_3_11,
                handler=f"{name}.handler",
                code=_lambda.Code.from_asset(
                    os.path.join(os.path.dirname(__file__), "..", "..", "backend", "lambdas", "resolvers")
                ),
                function_name=f"{env_name}-cm-{name.replace('_', '-')}",
                environment=env,
                timeout=cdk.Duration.seconds(timeout),
                memory_size=memory,
            )

            for t_name in (read_tables or []):
                tables[t_name].grant_read_data(fn)
            for t_name in (write_tables or []):
                tables[t_name].grant_read_write_data(fn)

            ds = api.add_lambda_data_source(f"{name}DS", fn)
            ds.create_resolver(
                id=f"{name}Resolver",
                type_name=type_name,
                field_name=field_name,
            )
            return fn

        # ---- Cognito IAM policy ----
        cognito_policy = iam.PolicyStatement(
            actions=[
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminListGroupsForUser",
            ],
            resources=[user_pool.user_pool_arn],
        )

        # ---- Resolvers ----

        # syncUser
        sync_user_fn = create_resolver(
            "sync_user", "Mutation", "syncUser",
            write_tables=["users"],
            extra_env={"USER_POOL_ID": user_pool.user_pool_id},
        )
        sync_user_fn.add_to_role_policy(cognito_policy)

        # listMysteries
        create_resolver(
            "list_mysteries", "Query", "listMysteries",
            read_tables=["mysteries", "characters", "users"],
        )

        # getMystery
        create_resolver(
            "get_mystery", "Query", "getMystery",
            read_tables=["mysteries", "characters", "users"],
        )

        # startGame
        create_resolver(
            "start_game", "Mutation", "startGame",
            read_tables=["mysteries", "users"],
            write_tables=["game_sessions"],
        )

        # getGameSession
        create_resolver(
            "get_game_session", "Query", "getGameSession",
            read_tables=["game_sessions", "interactions", "users"],
        )

        # listGameSessions
        create_resolver(
            "list_game_sessions", "Query", "listGameSessions",
            read_tables=["game_sessions", "users"],
        )

        # recordInteraction
        create_resolver(
            "record_interaction", "Mutation", "recordInteraction",
            read_tables=["game_sessions", "users"],
            write_tables=["interactions"],
        )

        # submitSolution
        create_resolver(
            "submit_solution", "Mutation", "submitSolution",
            read_tables=["mysteries", "users"],
            write_tables=["game_sessions"],
        )

        # getRealtimeToken
        token_fn = create_resolver(
            "get_realtime_token", "Query", "getRealtimeToken",
            read_tables=["users", "characters"],
            extra_env={"OPENAI_SECRET_NAME": openai_secret.secret_name},
            timeout=10,
        )
        openai_secret.grant_read(token_fn)

        # useHint
        create_resolver(
            "use_hint", "Mutation", "useHint",
            read_tables=["mysteries", "characters", "interactions", "users"],
            write_tables=["game_sessions"],
        )

        # getUserProfile
        create_resolver(
            "get_user_profile", "Query", "getUserProfile",
            read_tables=["users", "game_sessions"],
        )

        # ---- Exports ----
        self.graphql_url = api.graphql_url
        self.user_pool_id = user_pool.user_pool_id
        self.user_pool_client_id = user_pool_client.user_pool_client_id

        cdk.CfnOutput(self, "GraphQLUrl", value=api.graphql_url, export_name=f"{env_name}-cm-graphql-url")
        cdk.CfnOutput(self, "UserPoolId", value=user_pool.user_pool_id, export_name=f"{env_name}-cm-user-pool-id")
        cdk.CfnOutput(self, "UserPoolClientId", value=user_pool_client.user_pool_client_id, export_name=f"{env_name}-cm-user-pool-client-id")
        cdk.CfnOutput(self, "Region", value=self.region, export_name=f"{env_name}-cm-region")

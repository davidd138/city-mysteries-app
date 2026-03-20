def handler(event, context):
    event["response"]["autoConfirmUser"] = False
    event["response"]["autoVerifyEmail"] = False
    return event

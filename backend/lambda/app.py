import json

REPORTS = []


def lambda_handler(event, context):
    method = event.get("httpMethod", "")
    path = event.get("path", "")

    if path != "/reports":
        return _response(404, {"message": "Not found"})

    if method == "POST":
        return _create_report(event)

    if method == "GET":
        return _list_reports()

    return _response(405, {"message": "Method not allowed"})


def _create_report(event):
    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return _response(400, {"message": "Invalid JSON"})

    title = body.get("title")
    description = body.get("description")

    if not title or not description:
        return _response(400, {"message": "title and description are required"})

    report = {
        "id": "report-" + str(hash(str(event))),
        "title": title,
        "description": description,
        "location": body.get("location"),
        "status": "NEW",
        "created": "2026-05-11T12:00:00Z",
    }

    REPORTS.append(report)
    return _response(201, report)


def _list_reports():
    return _response(200, {"items": REPORTS})


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body),
    }
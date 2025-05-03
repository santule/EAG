import gspread
from oauth2client.service_account import ServiceAccountCredentials

def append_string_to_sheet(text: str, sheet_name="mcqs_sheet", creds_file="gen-lang-client-0931579959-00d30d9b2183.json"):
    # Define scope and load credentials
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_file, scope)
    client = gspread.authorize(creds)

    # Open the spreadsheet and select the first sheet
    sheet = client.open(sheet_name).sheet1

    # Insert the string as a new row (in column A)
    sheet.append_row([text])

# Example usage:
if __name__ == "__main__":
    append_string_to_sheet("Hello, world!")

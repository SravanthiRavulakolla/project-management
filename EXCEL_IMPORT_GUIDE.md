# Excel Import Feature for Problem Statements

## Overview
This feature allows guides to add multiple problem statements efficiently by uploading an Excel file, instead of manually entering each problem one by one.

## Features

### 1. **Manual Entry**
- Traditional form-based input for adding individual problem statements
- Fields: COE, Target Year, Title, Description, Dataset URL

### 2. **Excel Import**
- Bulk import of problem statements from Excel files (.xlsx, .xls, .csv)
- Automatic validation and error reporting
- Progress tracking during import
- Support for multiple problem statements in a single file

### 3. **Template Download**
- Download a pre-formatted Excel template
- Includes sample data and instructions
- Helps ensure proper format for import

## How to Use

### Step 1: Download Template (Optional)
1. Click "📊 Import from Excel" button
2. Click "📥 Download Template" to get the Excel template
3. The template includes sample data and an Instructions sheet

### Step 2: Prepare Your Excel File

Your Excel file should have the following columns in this exact order:
- **Column 1: COE** - Center of Excellence name
- **Column 2: Target Year** - Year level (2nd, 3rd, or 4th)
- **Column 3: Title** - Problem statement title
- **Column 4: Description** - Detailed problem description
- **Column 5: Dataset URL** - Optional link to dataset

### Step 3: Upload and Import
1. Click "📊 Import from Excel" button in the Guide Dashboard
2. Click in the file upload area or drag your Excel file
3. Review the preview (first 5 rows)
4. Click "📤 Import Problems" to start the import
5. Monitor the progress bar
6. Success message confirms the number of problems imported

## Excel Format Example

| COE | Target Year | Title | Description | Dataset URL |
|-----|------------|-------|-------------|------------|
| Data Analytics | 3rd | Customer Behavior Analysis | Analyze customer purchase patterns... | https://example.com/data.csv |
| Machine Learning | 4th | Image Classification | Build a model to classify images... | https://example.com/images.zip |
| IoT | 3rd | Smart Home Automation | Design an IoT solution for home... | |

## Important Notes

### Column Names are Case-Insensitive
The system recognizes these variations:
- COE, coe, CoE
- Target Year, target year, targetYear
- Title, title
- Description, description
- Dataset URL, dataset url, datasetUrl

### Validation Rules

1. **COE Name** - Must exactly match one of the available COEs in the system
2. **Target Year** - Must be one of: 2nd, 3rd, 4th (exact match required)
3. **Title** - Required field, cannot be empty
4. **Description** - Optional but recommended
5. **Dataset URL** - Optional, should be a valid URL if provided

### Error Handling

If there are validation errors:
- The system will display which rows have invalid data
- Reasons for failure are clearly stated
- Valid rows are not imported if any errors are found
- Fix the Excel file and try again

### File Types Supported
- .xlsx (Excel 2007+)
- .xls (Excel 97-2003)
- .csv (Comma-separated values)

## Workflow Example

1. **Scenario**: You have 4 problem statements to add across different COEs and years

2. **Using Manual Entry**: Would require 4 separate form submissions
   - Time-consuming
   - More prone to errors
   - Requires reloading page each time

3. **Using Excel Import**: 
   - Create Excel with all 4 rows
   - Single upload
   - All validated at once
   - Automatic progress tracking

## Tips for Best Results

1. **Download the template first** - It has the correct format and column headers
2. **Use exact COE names** - Copy-paste from the available COEs list if unsure
3. **Use exact year format** - "3rd" not "Third", "2nd" not "Second"
4. **Keep descriptions concise** - Very long text can be pasted in Excel cells
5. **Double-check before importing** - Review the preview before clicking Import

## Technical Details

### Files Modified/Created
- `frontend/src/pages/guide/ExcelImportProblem.jsx` - Excel import component
- `frontend/src/utils/excelTemplate.js` - Template generation utility
- `frontend/src/pages/guide/GuideDashboard.jsx` - Updated to include Excel import option
- `frontend/package.json` - Added xlsx dependency

### How It Works
1. Excel file is read using the `xlsx` library
2. First sheet is parsed into JSON format
3. Each row is validated against available COEs and target years
4. Valid rows are sent to the API for creation
5. Import progress is tracked in real-time
6. Success/failure messages are displayed

### API Calls
- Uses existing `api.createProblem()` endpoint
- One API call per problem statement (can be optimized for bulk operations)
- All API calls use authentication from auth context

## Troubleshooting

**Issue**: "Invalid data in rows: 1, 3"
- Check that COE names match available options exactly
- Verify Target Year is 2nd, 3rd, or 4th
- Ensure Title field is not empty

**Issue**: "Error reading file"
- Verify file is .xlsx, .xls, or .csv format
- Try opening in Excel and re-saving if file is corrupted
- Ensure no special characters in filenames

**Issue**: Import seems stuck
- Wait for the progress bar to complete
- Check browser console for any errors
- Refresh page and try again if necessary

**Issue**: Some problems imported but not all
- Check the error message for specific row numbers
- Review the Excel format for those rows
- Upload the file again with corrections

## Future Enhancements

Potential improvements for this feature:
1. Bulk API endpoint for faster imports (one call instead of N calls)
2. Excel validation during preview (highlight invalid cells)
3. Allow custom column mapping
4. Support for updates (re-importing to update existing problems)
5. Import history/audit log
6. Undo last import feature


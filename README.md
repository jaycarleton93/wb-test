# Welbi Test
This sample application is an admin tool for a fictional set of residents and programs.  
Note that the base JavaScript file is located at `src/js/page/index`(for code cleanliness reasons), and the config file that points there may need to be adjusted.

## Tech stack
This application is built using React on top of Node.js.

## Functionality
Each time a (different) button or table is clicked, a `GET` call will be made to the appropriate resource.  
If for any reason an error is encountered, a blank table with an error message will be displayed instead.

### First table
Pressing on one of the top two buttons will populate the uppermost table with a list of all `Residents`, or `Programs`. 

### Second table
Clicking on an individual row in the first table will give you attendance information specific to that entry in the second table.  
- If you clicked on a resident, the 2nd table will be populated with the programs they attend/attended.  
- If you clicked on a program, it will show all residents who attend/attended it.  
    
### New Form
This form will create a new resident or program, depending on the top selection.  
Input will be validated when the submit button is pressed.  
For fields that populate arrays, the values are entered as a comma-seperated string.  
The `attendance` field for both cases is left as an empty array to start, though it can be populated afterwards using the third table below.
      
### Third table
The 3rd table is used only when you have pressed the `Residents` button, and then further selected a specific resident.  
  
This table lists all programs that the resident does not yet attend. Clicking on an entry here will ask you to confirm your choice, then makes a `POST` call to attend that resident to the program.  
Once this is done, all tables will individually refresh.

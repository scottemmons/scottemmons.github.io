//Assumes var combinedData; already loaded from html

function createDatasetVar(data) {
	var returnSet = [];
	var categoryNames = ["media - magazine", "media - television", ""];

	//Loop through data and assign attributes "label", "reAge", "hhAge", "reGender", "hhGender", "reMarried", "hhMarried", "numKids", "ageKids", "numAdults", "hIncome", "reEducation", "hhEducation", "reHoursWork", "hSize", "reEmployment", "hhEmployment"
	for (i = 0; i < data.length; i++) {
		var datum = data[i];

		if (datum["Value Type"] === "Weighted" && datum["Answer"] !== "NO" && datum["Answer"] !== "NONE" && datum["Answer"] !== "NONE OF THESE" && datum["Answer"] !== "DON'T KNOW/NO ANSWER") {
			//Label to be displayed
			var label = datum["Appear As"].toLowerCase();
			var categoryName = datum["Category"].toLowerCase();
			//Category number based on the good's industry
			var categoryNum = categoryNames.indexOf(datum["Category"].toLowerCase()) - 2;
			if (categoryNum === -3) {
				categoryNum = categoryNames.length - 2;
				categoryNames[categoryNames.length] = datum["Category"].toLowerCase();
			}
			//Average age in years
			var reAge = ((datum["AGE: 18"]*18.0 + datum["AGE: 19"]*19.0 + datum["AGE: 20"]*20.0 + datum["AGE: 21"]*21.0 + datum["AGE: 22 - 24"]*23.5 + datum["AGE: 25 - 29"]*27.5 + datum["AGE: 30 - 34"]*32.5 + datum["AGE: 35 - 39"]*37.5 + datum["AGE: 40 - 44"]*42.5 + datum["AGE: 45 - 49"]*47.5 + datum["AGE: 50 - 54"]*52.5 + datum["AGE: 55 - 59"]*57.5 + datum["AGE: 60 - 64"]*62.5 + datum["AGE: 65 - 69"]*67.5 + datum["AGE: 70 - 74"]*72.5 + datum["AGE: 75+"]*80.0) / datum["Total"]);
			var hhAge = ((datum["AGE - HOUSEHOLD HEAD: 18"]*18.0 + datum["AGE - HOUSEHOLD HEAD: 19"]*19.0 + datum["AGE - HOUSEHOLD HEAD: 20"]*20.0 + datum["AGE - HOUSEHOLD HEAD: 21"]*21.0 + datum["AGE - HOUSEHOLD HEAD: 22-24"]*23.5 + datum["AGE - HOUSEHOLD HEAD: 25-29"]*27.5 + datum["AGE - HOUSEHOLD HEAD: 30-34"]*32.5 + datum["AGE - HOUSEHOLD HEAD: 35-39"]*37.5 + datum["AGE - HOUSEHOLD HEAD: 40-44"]*42.5 + datum["AGE - HOUSEHOLD HEAD: 45-49"]*47.5 + datum["AGE - HOUSEHOLD HEAD: 50-54"]*52.5 + datum["AGE - HOUSEHOLD HEAD: 55-59"]*57.5 + datum["AGE - HOUSEHOLD HEAD: 60-64"]*62.5 + datum["AGE - HOUSEHOLD HEAD: 65-69"]*67.5 + datum["AGE - HOUSEHOLD HEAD: 70-74"]*72.5 + datum["AGE - HOUSEHOLD HEAD: 75 OR OLDER"]*80.0) / datum["Total"]);
			//Percent male
			var reGender = (datum["GENDER: MALE"] / datum["Total"] * 100.0);
			var hhGender = (datum["SEX - HOUSEHOLD HEAD: MALE"] / datum["Total"] * 100.0);
			//Percent currently married
			var reMarried = (datum["MARITAL STATUS - RESPONDENT: PRESENTLY MARRIED"] / datum["Total"] * 100.0);
			var hhMarried = (datum["MARITAL STATUS - HOUSEHOLD HEAD: PRESENTLY MARRIED"] / datum["Total"] * 100.0);
			//Average number of kids in household
			var numKids = ((datum["NUMBER OF CHILDREN: NONE"] * 0.0 + datum["NUMBER OF CHILDREN: ONE"] * 1.0 + datum["NUMBER OF CHILDREN: TWO"] * 2.0 + datum["NUMBER OF CHILDREN: THREE"] * 3.0 + datum["NUMBER OF CHILDREN: FOUR"] * 4.0 + datum["NUMBER OF CHILDREN: FIVE"] * 5.0 + datum["NUMBER OF CHILDREN: SIX"] * 6.0 + datum["NUMBER OF CHILDREN: SEVEN"] * 7.0 + datum["NUMBER OF CHILDREN: EIGHT"] * 8.0 + datum["NUMBER OF CHILDREN: NINE"] * 9.0 + datum["NUMBER OF CHILDREN: TEN"] * 10.0) / datum["Total"]);
			//Average age of kids in household in years
			var ageKids = ((datum["PRESENCE OF CHILDREN BY AGE: UNDER 2 YEARS"] * 1.0 + datum["PRESENCE OF CHILDREN BY AGE: 2 - 5 YEARS"] * 4.0 + datum["PRESENCE OF CHILDREN BY AGE: 6 TO 9 YEARS"] * 8.0 + datum["PRESENCE OF CHILDREN BY AGE: 10 TO 11 YEARS"] * 11.0 + datum["PRESENCE OF CHILDREN BY AGE: 12 - 17 YEARS"] * 15.0) / datum["Total"]);			
			//Average number of adults in household
			var numAdults = ((datum["NO. OF ADULTS IN HOUSEHOLD: ONE"] * 1.0 + datum["NO. OF ADULTS IN HOUSEHOLD: TWO"] * 2.0 + datum["NO. OF ADULTS IN HOUSEHOLD: THREE"] * 3.0 + datum["NO. OF ADULTS IN HOUSEHOLD: FOUR"] * 4.0 + datum["NO. OF ADULTS IN HOUSEHOLD: FIVE"] * 5.0 + datum["NO. OF ADULTS IN HOUSEHOLD: SIX OR MORE"] * 7.0) / datum["Total"]);
			//Average dollar amount per year of household income
			var hIncome = ((datum["HOUSEHOLD INCOME: LESS THAN $5,000"] * 2500.0 + datum["HOUSEHOLD INCOME: $ 5,000 - $ 7,499"] * 6250.0 + datum["HOUSEHOLD INCOME: $ 7,500 - $ 9,999"] * 8750.0 + datum["HOUSEHOLD INCOME: $10,000 - $12,499"] * 11250.0 + datum["HOUSEHOLD INCOME: $12,500 - $14,999"] * 13750.0 + datum["HOUSEHOLD INCOME: $15,000 - $19,999"] * 17500.0 + datum["HOUSEHOLD INCOME: $20,000 - $24,999"] * 22500.0 + datum["HOUSEHOLD INCOME: $25,000 - $29,999"] * 27500.0 + datum["HOUSEHOLD INCOME: $30,000 - $34,999"] * 32500.0 + datum["HOUSEHOLD INCOME: $35,000 - $39,999"] * 37500.0 + datum["HOUSEHOLD INCOME: $40,000 - $44,999"] * 42500.0 + datum["HOUSEHOLD INCOME: $45,000 - $49,999"] * 47500.0 + datum["HOUSEHOLD INCOME: $50,000 - $59,999"] * 55000.0 + datum["HOUSEHOLD INCOME: $60,000 - $74,999"] * 67500.0 + datum["HOUSEHOLD INCOME: $75,000 - $99,999"] * 87500.0 + datum["HOUSEHOLD INCOME: $100,000 - $149,999"] * 125000.0 + datum["HOUSEHOLD INCOME: $150,000 - $249,999"] * 200000.0 + datum["HOUSEHOLD INCOME: $250,000 - $499,999"] * 375000.0 + datum["HOUSEHOLD INCOME: $500,000 OR MORE"] * 600000.0) / datum["Total"]);
			//Average number of years of schooling
			var reEducation = ((datum["EDUCATION - HIGHEST LEVEL COMPLETED: NO FORMAL SCHOOLING"] * 0.0 + datum["EDUCATION - HIGHEST LEVEL COMPLETED: SOME GRADE SCHOOL - 8 YEARS OR LESS"] * 4.0 + datum["EDUCATION - HIGHEST LEVEL COMPLETED: HIGH SCHOOL - 9-11 YEARS"] * 10.5 + datum["EDUCATION - HIGHEST LEVEL COMPLETED: HIGH SCHOOL - 12 YEARS (GRADUATED)"] * 12.0 + datum["EDUCATION - HIGHEST LEVEL COMPLETED: COLLEGE - LESS THAN 1 YEAR"] * 12.5 + datum["EDUCATION - HIGHEST LEVEL COMPLETED: COLLEGE - 1 FULL YEAR"] * 13.0 + datum["EDUCATION - HIGHEST LEVEL COMPLETED: COLLEGE - 2 FULL YEARS"] * 14.0 + datum["EDUCATION - HIGHEST LEVEL COMPLETED: COLLEGE-3 FULL YRS OR MORE(DID NOT GRAD)"] * 15.5 + datum["EDUCATION - HIGHEST LEVEL COMPLETED: COLLEGE - 4 YEARS (GRADUATED)"] * 16.0 + datum["EDUCATION - HIGHEST LEVEL COMPLETED: ATTENDED GRADUATE SCHOOL - NO DEGREE"] * 18.0 + datum["EDUCATION - HIGHEST LEVEL COMPLETED: ATTENDED GRADUATE SCHOOL - DEGREE"] * 20.0) / datum["Total"]);
			var hhEducation = ((datum["EDUCATION - HOUSEHOLD HEAD: NO GRADE SCHOOL"] * 0.0 + datum["EDUCATION - HOUSEHOLD HEAD: GRADE SCHOOL - 8 YEARS OR LESS"] * 4.0 + datum["EDUCATION - HOUSEHOLD HEAD: HIGH SCHOOL - 9-11 YEARS"] * 10.5 + datum["EDUCATION - HOUSEHOLD HEAD: HIGH SCHOOL - 12 YEARS (GRADUATED)"] * 12.0 + datum["EDUCATION - HOUSEHOLD HEAD: COLLEGE - LESS THAN 1 YEAR"] * 12.5 + datum["EDUCATION - HOUSEHOLD HEAD: COLLEGE - 1 YEAR"] * 13.0 + datum["EDUCATION - HOUSEHOLD HEAD: COLLEGE - 2 YEARS"] * 14.0 + datum["EDUCATION - HOUSEHOLD HEAD: COLLEGE - 3 YEARS"] * 15.0 + datum["EDUCATION - HOUSEHOLD HEAD: COLLEGE - 4 YEARS (GRADUATED)"] * 16.0 + datum["EDUCATION - HOUSEHOLD HEAD: ATTENDED GRADUATE SCHOOL - NO DEGREE"] * 18.0 + datum["EDUCATION - HOUSEHOLD HEAD: ATTENDED GRADUATE SCHOOL - DEGREE"] * 20.0) / datum["Total"]);
			//Average number of hours worked weekly
			var reHoursWork = ((datum["HOURS WORK WEEKLY: 1-14"] * 7.5 + datum["HOURS WORK WEEKLY: 15-29"] * 22.0 + datum["HOURS WORK WEEKLY: 30-39"] * 34.5 + datum["HOURS WORK WEEKLY: 40"] * 40.0 + datum["HOURS WORK WEEKLY: 41-50"] * 45.5 + datum["HOURS WORK WEEKLY: 51 OR MORE"] * 57.0) / datum["Total"]);
			//Average number of people in household
			var hSize = ((datum["NO. OF PEOPLE IN HOUSEHOLD: ONE"] * 1.0 + datum["NO. OF PEOPLE IN HOUSEHOLD: TWO"] * 2.0 + datum["NO. OF PEOPLE IN HOUSEHOLD: THREE"] * 3.0 + datum["NO. OF PEOPLE IN HOUSEHOLD: FOUR"] * 4.0 + datum["NO. OF PEOPLE IN HOUSEHOLD: FIVE"] * 5.0 + datum["NO. OF PEOPLE IN HOUSEHOLD: SIX"] * 6.0 + datum["NO. OF PEOPLE IN HOUSEHOLD: SEVEN"] * 7.0 + datum["NO. OF PEOPLE IN HOUSEHOLD: EIGHT OR MORE"] * 9.0) / datum["Total"]);
			//Percent employed full or part time
			var reEmployment = (datum["EMPLOYMENT STATUS: EMPLOYED FULL OR PART TIME"] / datum["Total"] * 100.0);
			var hhEmployment = (datum["EMPLOYMENT STATUS - HOUSEHOLD HEAD: EMPLOYED FULL OR PART TIME"] / datum["Total"] * 100.0);

			returnSet.push({"label" : label, "categoryName" : categoryName, "categoryNum" : categoryNum, "reAge" : reAge, "hhAge" : hhAge, "reGender" : reGender, "hhGender" : hhGender, "reMarried" : reMarried, "hhMarried" : hhMarried, "numKids" : numKids, "ageKids" : ageKids, "numAdults" : numAdults, "hIncome" : hIncome, "reEducation" : reEducation, "hhEducation" : hhEducation, "reHoursWork" : reHoursWork, "hSize" : hSize, "reEmployment" : reEmployment, "hhEmployment" : hhEmployment});
		}
	}

	return returnSet;
}

var dataset = createDatasetVar(combinedData);
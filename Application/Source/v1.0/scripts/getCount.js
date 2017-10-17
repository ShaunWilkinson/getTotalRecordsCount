function stoppedTyping() {
	if (this.value.length > 0) {
		document.getElementById("startCustomRetrieveBtn").disabled = false;
	} else {
		document.getElementById("startCustomRetrieveBtn").disabled = true;
	}
}

function verify() {
	if(document.getElementById("customEntity").value == "") {
		alert("No value entered in custom entity field");
		return;
	} else {
		swGetCount("custom");
	}
}

function swGetCount(generalOrCustom) {
	// General record count
	if (generalOrCustom == "general") {
		var entities = ["accounts", "contacts", "leads", "opportunities", "quotes", "salesorders", "workflows"];
		
		for (i = 0; i < entities.length; i++) {
			retrieveRecords(entities[i], 0);
		}
	} else {
	// Custom record count
		var customEntity = document.getElementById("customEntity").value;
		document.getElementById("customTitle").innerHTML = customEntity;
		if (customEntity != null) {
			retrieveRecords(customEntity, 1);
		}
	}
}

function retrieveRecords(recordName, custom, count, activeCount, oDataNextLink) {
	count = count || 0;
	activeCount = activeCount || 0;
	oDataNextLink = oDataNextLink || 0;
	
	var recordNameSingular;
	// If recordname ends in 'ies' then removes 'ies' and replace with 'y'
	if (recordName.substr(recordName.length - 3) == "ies") {
		recordNameSingular = recordName.substr(0, recordName.length - 3);
		recordNameSingular = recordNameSingular + "y";
	} else if (recordName.substr(recordName.length - 1) == "s") {
	// else just remove 's'
		recordNameSingular = recordName.substr(0, recordName.length - 1);
	}
	
	var orgUrl = window.parent.Xrm.Page.context.getClientUrl();
	var requestUrl = orgUrl + "/api/data/v8.0/" 
		+ recordName
		+ "?$select="
		+ recordNameSingular + "id"
		+ ",statuscode";

	var request = new XMLHttpRequest();
	// Make a standard request otherwise request the next page
	if (oDataNextLink == 0) { 
		request.open("GET", encodeURI(requestUrl), true);
	} else { 
		request.open("GET", oDataNextLink, true); 
	}
	request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    request.setRequestHeader("OData-MaxVersion", "4.0");
    request.setRequestHeader("OData-Version", "4.0");
    
	request.onreadystatechange = function() {
		if (this.readyState == 4) {
			request.onreadystatechange = null;

			if (this.status == 200) {
				/* contains data */
				var data = JSON.parse(this.responseText);
				
				// Loop through returned records and count active
				for (i = 0; i < data.value.length; i++) {
					if (data.value[i].statuscode == 1) {
						activeCount++;	
					}
				}
				
				// Get current count
				count = count + data.value.length;
				inactiveCount = count - activeCount;

				activePercentage = (activeCount / count) * 100;
				activePercentage = activePercentage.toFixed(0);
				inactivePercentage = 100 - activePercentage;
				
				// Update text values
				if (custom == 0) {
					document.getElementById(recordName + "ActiveCount").innerHTML = activeCount;
					document.getElementById(recordName + "Count").innerHTML = count;
					document.getElementById(recordName + "InactiveCount").innerHTML = inactiveCount;
					if(!isNaN(activePercentage)) {
						document.getElementById(recordName + "ActivePercentageCount").innerHTML = activePercentage;
					} else {
						document.getElementById(recordName + "ActivePercentageCount").innerHTML = 0;
					}

					if(!isNaN(inactivePercentage)) {
						document.getElementById(recordName + "InactivePercentageCount").innerHTML = inactivePercentage;
					} else {
						document.getElementById(recordName + "InactivePercentageCount").innerHTML = 0;
					}
				} else {
					document.getElementById("customActiveCount").innerHTML = activeCount;
					document.getElementById("customCount").innerHTML = count;
					document.getElementById("customInactiveCount").innerHTML = inactiveCount;
					document.getElementById("customActivePercentageCount").innerHTML = activePercentage;
					document.getElementById("customInactivePercentageCount").innerHTML = inactivePercentage;
				}
				
				// Get link to next data set
				var oDataNextLink = data['@odata.nextLink'];
				if (!oDataNextLink) {
					if (custom == 0) {
						document.getElementById(recordName + "CountStatus").innerHTML = "Finished.";
						document.getElementById(recordName + "CountStatus").style.color = "green";
						document.getElementById("startRetrieveBtn").disabled = false;
					} else {
						document.getElementById("startCustomRetrieveBtn").disabled = false;
						document.getElementById("customCountStatus").innerHTML = "Finished.";
						document.getElementById("customCountStatus").style.color = "green";
					}
					return;
				}
				
				// Call self
				retrieveRecords(recordName, custom, count, activeCount, oDataNextLink);
			} else {
				var error = JSON.parse(this.response).error;
				console.log(error.message);
					
				if (custom == 0) {
					document.getElementById("startRetrieveBtn").disabled = false;
					document.getElementById(recordName + "CountStatus").innerHTML = "Error.";
					document.getElementById(recordName + "CountStatus").style.color = "red";
				} else {
					document.getElementById("startCustomRetrieveBtn").disabled = false;
					document.getElementById("customCountStatus").innerHTML = "Error.";
					document.getElementById("customCountStatus").style.color = "red";
				}
			}
		}
	}

	request.send();
	
	if (custom == 0) {
		document.getElementById("startRetrieveBtn").disabled = true;
		document.getElementById(recordName + "CountStatus").innerHTML = "Collecting...";
		document.getElementById(recordName + "CountStatus").style.color = "orange";
	} else {
		document.getElementById("startCustomRetrieveBtn").disabled = true;
		document.getElementById("customCountStatus").innerHTML = "Collecting...";
		document.getElementById("customCountStatus").style.color = "orange";
	}
}

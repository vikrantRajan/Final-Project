var common = (function()
{
    "use strict";
    
    /////////////
    // Variables.
    /////////////
    
    // The array of navigation links. These will be modified when the subscription key information changes.
    
    var uriBasePreRegion = "https://";
    var uriBasePostRegion = ".api.cognitive.microsoft.com/vision/";
    var uriBaseAnalyze = "v1.0/analyze";
    var uriBaseLandmark = "v1.0/models/landmarks/analyze";
    var uriBaseCelebrities = "v1.0/models/celebrities/analyze";
    var uriBaseThumbnail = "v1.0/generateThumbnail";
    var uriBaseOcr = "v1.0/ocr";
    var uriBaseHandwriting = "v1.0/recognizeText";

    var subscriptionChange = function()
    {
        // Build parameter string.
        var paramString = "?subscriptionKey=" + 
            encodeURIComponent(document.getElementById("subscriptionKeyInput").value) +
            "&subscriptionRegion=" + 
            encodeURIComponent(document.getElementById("subscriptionRegionSelect").value);
    };

    // Returns the value of the specified URL parameter.
    
    var getQueryVariable = function(paramaterName) 
    {
        // Get the URL parameters.
        var query = window.location.search.substring(1);
        // Split the parameters into a string array.
        var vars = query.split("&");
        // Parse the string array and return the value of the specified parameter.
        for (var i = 0; i < vars.length; ++i) 
        {
            var pair = vars[i].split("=");
            if (pair[0] === paramaterName)
            {
                // Return the value.
                return pair[1];
            }
        }   
        // If the parameter wasn't found, return false.
        return(false);
    }
    
    // Displays an error when an image does not load.
    
    var imageLoadError = function()
    {
        $("#responseTextArea").val("Image load error.");
    }
    
    // Initializes the page.
    var init = function()
    { 
        // Extract URL parameters into the subscription key elements.
        var subKey = getQueryVariable("subscriptionKey");
        if (subKey)
        {
            document.getElementById("subscriptionKeyInput").value = decodeURIComponent(subKey);
        }
        
        subKey = getQueryVariable("subscriptionRegion");
        if (subKey)
        {
            document.getElementById("subscriptionRegionSelect").value = decodeURIComponent(subKey);
        }
        
        subscriptionChange();
    };

    return {
        // Declare public members.
        init:                   init,
        getQueryVariable:       getQueryVariable,
        subscriptionChange:     subscriptionChange,
        imageLoadError:         imageLoadError,
        uriBasePreRegion:       uriBasePreRegion,
        uriBasePostRegion:      uriBasePostRegion,
        uriBaseAnalyze:         uriBaseAnalyze,
        uriBaseLandmark:        uriBaseLandmark,
        uriBaseCelebrities:     uriBaseCelebrities,
        uriBaseThumbnail:       uriBaseThumbnail,
        uriBaseOcr:             uriBaseOcr,
        uriBaseHandwriting:     uriBaseHandwriting
    };
})();


// Initialize the JavaScript code.

window.onload = common.init;

function analyzeButtonClick() {
    // Clear the display fields.
    $("#sourceImage").attr("src", "#");
    $("#captionSpan").text("");
    // Display the image.
    var sourceImageUrl = $("#inputImage").val();
    $("#sourceImage").attr("src", sourceImageUrl);
    AnalyzeImage(sourceImageUrl, $("#responseTextArea"), $("#captionSpan"));
}

/* Analyze the image at the specified URL by using Microsoft Cognitive Services Analyze Image API.
 * @param {string} sourceImageUrl - The URL to the image to analyze.
 * @param {<textarea> element} responseTextArea - The text area to display the JSON string returned
 *                             from the REST API call, or to display the error message if there was 
 *                             an error.
 * @param {<span> element} captionSpan - The span to display the image caption.
 */
function AnalyzeImage(sourceImageUrl, responseTextArea, captionSpan) {
    // Request parameters.
    var params = {
        "visualFeatures": "Categories,Description,Color",
        "details": "",
        "language": "en",
    };
    
    // Perform the REST API call.
    $.ajax({
        url: common.uriBasePreRegion + $("#subscriptionRegionSelect").val() + common.uriBasePostRegion + common.uriBaseAnalyze + "?" + $.param(params),             
        // Request headers.
        beforeSend: function(jqXHR){
            jqXHR.setRequestHeader("Content-Type","application/json");
            jqXHR.setRequestHeader("Ocp-Apim-Subscription-Key", 
                encodeURIComponent($("#subscriptionKeyInput").val()));
        },
        type: "POST",
        // Request body.
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })
    
    .done(function(data) {
        // Show formatted JSON on webpage.

        for(var i = 0; i < data.description.tags["length"]; ++i ) {
            // responseTextArea.val(data.description.tags[i]);
            $("#responseTextArea").append(`--------<h4>${data.description.tags[i]}</h4>`);  
        }

        // Extract and display the caption and confidence from the first caption in the description object.
        if (data.description && data.description.captions) {
            var caption = data.description.captions[0];
            if (caption.text && caption.confidence) {
                captionSpan.text("Caption: " + caption.text +
                    " (confidence: " + caption.confidence + ").");
            }
        }
    })
    
    .fail(function(jqXHR, textStatus, errorThrown) {
        // Prepare the error string.
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : (jQuery.parseJSON(jqXHR.responseText).message) ? 
        jQuery.parseJSON(jqXHR.responseText).message : jQuery.parseJSON(jqXHR.responseText).error.message;
        
        // Put the error JSON in the response textarea.
        responseTextArea.val(JSON.stringify(jqXHR, null, 2));
        
        // Show the error message.
        alert(`Sorry there was an error processing your request`);
        
        $("#responseTextArea").append(`<div><h3 class='error'>Sorry there was an error processing your request</h3></div>`);
        
    });
}

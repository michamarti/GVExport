/**
 * Data object to hold data fetching and validation functionality not related to the form
 *
 * @type {{}}
 */
const Data = {
    /**
     * Convert image URL to base64 data - we use for embedding images in SVG
     * From https://stackoverflow.com/questions/22172604/convert-image-from-url-to-base64
     *
     * @param img
     * @returns {string}
     */
    getBase64Image: function(img) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/png");
    },

    /**
     * Find image URLs and replace with embedded versions
     *
     * @param svg
     * @param type
     * @param img
     */
    replaceImageURLs: function(svg, type, img) {
        let startPos, len, url;
        let match = /<image.*xlink:href="http/.exec(svg);
        if (match != null) {
            startPos = match.index+match[0].length-4;
            len = svg.substring(startPos).indexOf("\"");
            url = svg.substring(startPos,startPos+len);
            const img2 = document.createElement("img");
            img2.onload = function() {
                let base64 = Data.getBase64Image(img2);
                svg = svg.replace(url,base64);
                Data.replaceImageURLs(svg, type, img);
                img2.remove();
            }
            img2.src = url.replace(/&amp;/g,"&");
        } else {
            if (type === "svg") {
                const svgBlob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
                const svgUrl = URL.createObjectURL(svgBlob);
                Data.download.downloadLink(svgUrl, download_file_name + "."+type);
            } else {
                img.src = "data:image/svg+xml;utf8," + svg;
            }
        }
    },

    /**
     *
     * @param help
     * @returns {Promise<unknown>}
     */
    getHelp(help) {
        let request = {
            "type": REQUEST_TYPE_GET_HELP,
            "help_name": help
        };
        let json = JSON.stringify(request);
        return sendRequest(json).then((response) => {
            let responseJson = Data.parseResponse(response);
            if (responseJson) {
                return responseJson.help;
            } else {
                return false;
            }
        });
    },

    parseResponse(response) {
        try {
            let json = JSON.parse(response);
            if (json.success) {
                return json;
            } else {
                return ERROR_CHAR + json.errorMessage;
            }
        } catch(e) {
            UI.showToast(ERROR_CHAR + e);
        }
        return false;
    },

    /**
     * Responsible for generating downloads and related activities
     */
    download: {

        /**
         * Request download of SVG file
         */
        downloadSVGAsText() {
            const svg = document.getElementById('rendering').getElementsByTagName('svg')[0].cloneNode(true);
            svg.removeAttribute("style");
            let svgData = svg.outerHTML.replace(/&nbsp;/g, '');
            // Replace image URLs with embedded data  for SVG also triggers download
            Data.replaceImageURLs(svgData, "svg", null);
        },

        /**
         * Request download of PDF file
         */
        downloadSVGAsPDF() {
            Data.download.downloadSVGAsImage("pdf");
        },

        /**
         * Request download of PNG file
         */
        downloadSVGAsPNG() {
            Data.download.downloadSVGAsImage("png");
        },

        /**
         * Request download of JPEG file
         */
        downloadSVGAsJPEG() {
            Data.download.downloadSVGAsImage("jpeg");
        },

        /**
         * Create and trigger download of diagram in the requested image type
         *
         * @param type one of the supported image types
         */
        downloadSVGAsImage(type) {
            const svg = document.getElementById('rendering').getElementsByTagName('svg')[0].cloneNode(true);
            // Style attribute used for the draggable browser view, remove this to reset to standard SVG
            svg.removeAttribute("style");

            const canvas = document.createElement("canvas");
            const img = document.createElement("img");
            // get svg data and remove line breaks
            let xml = new XMLSerializer().serializeToString(svg);
            // Fix the + symbol (any # breaks everything)
            xml = xml.replace(/&#45;/g, "+");
            // Replace # colours with rgb equivalent
            // From https://stackoverflow.com/questions/13875974/search-and-replace-hexadecimal-color-codes-with-rgb-values-in-a-string
            const rgbHex = /#([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])/gi;
            xml = xml.replace(rgbHex, function (m, r, g, b) {
                return 'rgb(' + parseInt(r, 16) + ','
                    + parseInt(g, 16) + ','
                    + parseInt(b, 16) + ')';
            });
            // Replace image URLs with embedded images
            Data.replaceImageURLs(xml, type, img);
            // Once image loaded, draw to canvas then download it
            img.onload = function () {
                canvas.setAttribute('width', img.width.toString());
                canvas.setAttribute('height', img.height.toString());
                // draw the image onto the canvas
                let context = canvas.getContext('2d');
                context.drawImage(img, 0, 0, img.width, img.height);
                // Download it
                const dataURL = canvas.toDataURL('image/' + type);
                if (dataURL.length < 10) {
                    UI.showToast(ERROR_CHAR + TRANSLATE['Your browser does not support exporting images this large. Please reduce number of records, reduce DPI setting, or use SVG option.']);
                } else if (type === "pdf") {
                    Data.download.createPdfFromImage(dataURL, img.width, img.height);
                } else {
                    Data.download.downloadLink(dataURL, download_file_name + "." + type);
                }
            }
        },

        /**
         * Create and download a PDF version of the provided image data
         *
         * @param imgData
         * @param width
         * @param height
         */
        createPdfFromImage(imgData, width, height) {
            const orientation = width >= height ? 'landscape' : 'portrait';
            const dpi = document.getElementById('dpi').value;
            const widthInches = width / dpi;
            const heightInches = height / dpi;
            const doc = new window.jspdf.jsPDF({orientation: orientation, format: [widthInches, heightInches], unit: 'in'});
            doc.addImage(imgData, "PNG", 0, 0, widthInches, heightInches);
            // If running test suite, don't actually trigger download of data
            // We have generated it so know it works
            if (!window.Cypress) {
                doc.save(download_file_name + ".pdf");
            }
        },

        /**
         * Trigger a download via javascript
         *
         * @param URL
         * @param filename
         */
        downloadLink(URL, filename) {
            const downloadLinkElement = document.createElement("a");
            downloadLinkElement.href = URL;
            downloadLinkElement.download = filename;
            document.body.appendChild(downloadLinkElement);
            // If running test suite, don't actually trigger download of data
            // We have generated it so know it works
            if (!window.Cypress) {
                downloadLinkElement.click();
            }
            document.body.removeChild(downloadLinkElement);
        },
    },

    /**
     * Section of form that handles saving and loading settings from a list
     */
    savedSettings: {
        /**
         * Updates a setting in the saved settings list to have a new name
         *
         * @param id
         * @param userPrompted
         * @returns {boolean}
         */
        renameSetting(id, userPrompted = false) {
            let name = "";
            if (userPrompted) {
                name = document.getElementById('rename_text').value;
                document.getElementById('modal').remove();
                if (name === '') return false;
            } else {
                let originalName = document.querySelector('[data-id="' + id + '"]').getAttribute('data-name');
                let message = TRANSLATE["Enter new setting name"] + ': <input type="text" onfocus="this.selectionStart = this.selectionEnd = this.value.length;" id="rename_text" value="' + originalName + '" autofocus="autofocus">';
                let buttons = '<div class="modal-button-container"><button class="btn btn-secondary modal-button" onclick="document.getElementById(' + "'modal'" + ').remove()">' + TRANSLATE['Cancel'] + '</button><button class="btn btn-primary modal-button" onclick="Data.savedSettings.renameSetting(\'' + id + '\', true)">' + TRANSLATE['Rename'] + '</button></div>';
                showModal('<div class="modal-container">' + message + '<br>' + buttons + '</div>');
                return false;
            }
            isUserLoggedIn().then((loggedIn) => {
                if (loggedIn) {
                    let request = {
                        "type": REQUEST_TYPE_RENAME_SETTINGS,
                        "settings_id": id,
                        "name": name
                    };
                    let json = JSON.stringify(request);
                    sendRequest(json).then((response) => {
                        try {
                            let json = JSON.parse(response);
                            if (json.success) {
                                loadSettingsDetails();
                                UI.showToast(TRANSLATE['Update successful']);
                            } else {
                                UI.showToast(ERROR_CHAR + json.errorMessage);
                            }
                        } catch (e) {
                            UI.showToast("Failed to load response: " + e);
                            return false;
                        }
                    });
                } else {
                    // Logged out so save in browser
                    let settings_field = document.getElementById('save_settings_name');
                    let settings_text = settings_field.value;
                    settings_field.value = name;
                    saveSettingsClient(id).then(() => {
                        settings_field.value = settings_text;
                        loadSettingsDetails();
                    }).catch(error => UI.showToast(error));
                }
            });
        },

        /**
         * Delete a saved settings item saved on the server
         *
         * @param id
         * @returns {Promise<void>}
         */
        async deleteSettingsServer(id) {
            const request = {
                "type": REQUEST_TYPE_DELETE_SETTINGS,
                "settings_id": id
            };
            const json = JSON.stringify(request);
            const response = await sendRequest(json);
            const parsedResponse = JSON.parse(response);

            if (!parsedResponse.success) {
                throw new Error(parsedResponse.errorMessage);
            }
        },

        /**
         * Delete a saved settings item saved on the server
         *
         * @param id
         */
        deleteSettingsClient(id) {
            getTreeName().then((treeName) => {
                try {
                    localStorage.removeItem("GVE_Settings_" + treeName + "_" + id);
                    deleteIdLocal(id);
                } catch (e) {
                    UI.showToast(e);
                }
            });
        },

        /**
         * Retrieve a link for sharing the settings saved in this settings record
         *
         * @param id
         * @returns {Promise<unknown>}
         */
        getSavedSettingsLink(id) {
            return isUserLoggedIn().then((loggedIn) => {
                if (loggedIn) {
                    let request = {
                        "type": REQUEST_TYPE_GET_SAVED_SETTINGS_LINK,
                        "settings_id": id
                    };
                    let json = JSON.stringify(request);
                    return sendRequest(json).then((response) => {
                        loadSettingsDetails();
                        try {
                            let json = JSON.parse(response);
                            if (json.success) {
                                return json.url;
                            } else {
                                UI.showToast(ERROR_CHAR + json.errorMessage);
                            }
                        } catch (e) {
                            UI.showToast("Failed to load response: " + e);
                            return false;
                        }
                    });
                }
            });
        },

    }
}
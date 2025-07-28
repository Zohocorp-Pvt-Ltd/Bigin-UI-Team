const svgGeneratorContent = `<div class="p20">
    <div class="page-title mB10">SVG Code Generator with Preview</div>
    <div style="display: flex; flex-direction: column;">

         <!-- 👇 Category Dropdown -->
    <div style="margin-bottom: 10px;display:flex;align-items: center;">
      <label for="icon-category"><strong>Icon Category:</strong></label>
      <select id="icon-category" style="margin-left: 10px;"></select>
      <input
        type="text"
        id="new-category-input"
        placeholder="Enter new category"
        style="display:none; margin-left: 10px; padding: 5px;"
      />
    </div>


        <div class="drop-area" id="drop-area">
            <p>Drag & drop an SVG file here, or click to upload</p>
            <input type="file" id="file-input" multiple accept=".svg" style="display: none;" />
        </div>

        <div style="display: flex; flex-direction: column;position: relative;">
            <div style="display: flex;justify-content: space-between;align-items: center;">
                <div style="font-weight: 600;">Generated Code:</div>
                <div id="copyToClipboard" style="display: none;" class="copy-to-clipboard">Copy</div>
                <button id="saveToIconsFile" class="copy-to-clipboard" style="margin-top: 10px;display: none;">
                    Save to Icons File
                </button>
            </div>
            <textarea class="svg-ouput" id="output" readonly></textarea>
        </div>

        <div class="preview" id="preview-container" style="display: none;">
            <strong>Live Preview:</strong><br />
            <div id="preview-wrap"></div>
        </div>
    </div>
</div>`

function initiateSVGCodeGenerator() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const output = document.getElementById('output');
    const copyToClipboard = document.getElementById('copyToClipboard');
    const saveToIconsFile = document.getElementById('saveToIconsFile');
    const previewContainer = document.getElementById('preview-container');
    const previewWrap = document.getElementById('preview-wrap');
    categorySelect = document.getElementById('icon-category');
    newCategoryInput = document.getElementById('new-category-input');
    var iconsList = iconsArray.map(x => x.icons).flat()

    // Clear and populate the dropdown
    categorySelect.innerHTML = `<option value="">Select</option>`;
    iconsArray.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.api_name;
        opt.textContent = cat.name;
        categorySelect.appendChild(opt);
    });

    // Add "New Category" option at the end
    const newOpt = document.createElement('option');
    newOpt.value = 'new';
    newOpt.textContent = '+ Add New Category';
    categorySelect.appendChild(newOpt);

    categorySelect.addEventListener('change', () => {
        if (categorySelect.value === 'new') {
            newCategoryInput.style.display = 'block';
        } else {
            newCategoryInput.style.display = 'none';
        }
    });

    dropArea.addEventListener('click', () => fileInput.click());

    dropArea.addEventListener('dragover', e => {
        e.preventDefault();
        dropArea.style.borderColor = 'blue';
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = '#999';
    });

    dropArea.addEventListener('drop', e => {
        e.preventDefault();
        dropArea.style.borderColor = '#999';
        const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'image/svg+xml');
        output.value = ''; // Clear previous output
        iconsAdded = []; // Reset iconsAdded array
        previewWrap.innerHTML = ''; // Clear previous previews
        files.forEach(processSVG);
    });
    fileInput.addEventListener('change', e => {
        const files = Array.from(e.target.files).filter(f => f.type === 'image/svg+xml');
        output.value = ''; // Clear previous output
        iconsAdded = []; // Reset iconsAdded array
        previewWrap.innerHTML = ''; // Clear previous previews
        files.forEach(processSVG);
    });

    copyToClipboard.addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('output').value).then(() => {
            alert('Code copied to clipboard!');
        })
    });

    saveToIconsFile.addEventListener('click', async () => {
        for (var i = 0; i < iconsAdded.length; i++) {
            for (var j = 0; j < iconsArray.length; j++) {
                if (iconsArray[j].icons.some(icon => icon.iconName === iconsAdded[i])) {
                    return alert(`❌ Icon "${iconsAdded[i]}" already exists in category "${iconsArray[j].name}". Please remove duplicate icons.`);
                }
            }
        }
        if (!categorySelect.value || (categorySelect.value === 'new' && !newCategoryInput.value)) {
            return alert('Please select a category or create a new one.');
        }
        if (output.value.trim() === '') {
            return alert('No SVG code generated. Please upload an SVG file first.');
        }
        var svgCode = output.value;
        iconSourceHTML = `<template tag-name="ux-icons-holder"> \n ${uxIconsHTML.replace('//add-here', svgCode)} \n </template>`;
        svgCode += `//update-here`; // Placeholder for appending to icons file
        var updatedIconSVG = `var uxIconsHTML = \`${uxIconsHTML.replace('//add-here', svgCode)}\``;
        updatedIconSVG = updatedIconSVG.replace('//update-here', '//add-here'); // Remove placeholder
        uploadFileToGitHub(updatedIconSVG);
    });

    //         function processSVG(file) {
    //             const reader = new FileReader();
    //             reader.onload = () => {
    //                 const svgText = reader.result;
    //                 const parser = new DOMParser();
    //                 const doc = parser.parseFromString(svgText, 'image/svg+xml');
    //                 const svg = doc.querySelector('svg');
    //                 if (!svg) return alert('Invalid SVG');

    //                 const viewBox = svg.getAttribute('viewBox') || '0 0 24 24';
    //                 const idBase = file.name.replace(/\.svg$/i, '').replace(/\W+/g, '_');

    //                 const gId = `${idBase}_ref`;
    //                 const symbolId = `${idBase}`;

    //                 const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    //                 g.setAttribute("id", gId);
    //                 g.setAttribute("fill", 'none');
    //                 g.innerHTML = svg.innerHTML;

    //                 const serializer = new XMLSerializer();
    //                 var gCode = serializer.serializeToString(g);

    //                 // ❌ Remove any xmlns="http://www.w3.org/2000/svg"
    //                 gCode = gCode.replace(/\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '');

    //                 const symbolCode = `
    // <symbol viewBox="${viewBox}" id="${symbolId}">
    //     <use href="#${gId}"></use>
    // </symbol>`.trim();

    //                 output.value = `${gCode}\n\n${symbolCode}\n\n`;

    //                 // Clear existing svgContainer if any
    //                 let svgContainer = document.getElementById('defs-container');
    //                 if (svgContainer) {
    //                     svgContainer.remove();
    //                 }

    //                 // Inject <g> and <symbol> for preview
    //                 svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    //                 svgContainer.setAttribute("style", "display: none;");
    //                 svgContainer.setAttribute("id", "defs-container");
    //                 svgContainer.innerHTML = `${gCode}\n${symbolCode}`;
    //                 document.body.appendChild(svgContainer);

    //                 preview.setAttribute("viewBox", viewBox);
    //                 previewUse.setAttribute("href", `#${symbolId}`);
    //                 document.querySelector('#preview-container').style.display = 'block';
    //                 document.querySelector('#copyToClipboard').style.display = 'block';
    //             };
    //             reader.readAsText(file);
    //         }
    function processSVG(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const svgText = reader.result;
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, 'image/svg+xml');
            const svg = doc.querySelector('svg');
            if (!svg) return alert(`Invalid SVG: ${file.name}`);

            const viewBox = svg.getAttribute('viewBox') || '0 0 24 24';
            const idBase = file.name.replace(/\.svg$/i, '').replace(/\W+/g, '_');

            const gId = `${idBase}_ref`;
            const symbolId = `${idBase}`;

            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("id", gId);
            g.setAttribute("fill", 'none');
            g.innerHTML = svg.innerHTML;

            const serializer = new XMLSerializer();
            let gCode = serializer.serializeToString(g);
            gCode = gCode.replace(/\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '');

            const symbolCode = `
<symbol viewBox="${viewBox}" id="${symbolId}">
    <use href="#${gId}"></use>
</symbol>\n`.trim();
            iconsAdded.push(symbolId);

            // Append to textarea
            output.value += `${gCode}\n\n${symbolCode}\n\n`;

            // Add to hidden SVG <defs-container>
            let svgContainer = document.getElementById('defs-container');
            if (!svgContainer) {
                svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svgContainer.setAttribute("style", "display: none;");
                svgContainer.setAttribute("id", "defs-container");
                document.body.appendChild(svgContainer);
            }
            svgContainer.innerHTML += `${gCode}\n${symbolCode}\n`;

            // Add preview
            previewWrap.style.display = "flex"; 
            previewWrap.style.margin = "10px";
            previewWrap.innerHTML += `<div style="margin-right:20px;">
            <svg viewBox="${viewBox}" width="80" height="80">
                <use href="#${symbolId}"></use>
            </svg>
            <div style="text-align:center;font-size:12px">${symbolId}</div>
        </div>`;
            previewContainer.appendChild(previewWrap);

            // Show sections
            previewContainer.style.display = 'block';
            copyToClipboard.style.display = 'block';
            saveToIconsFile.style.display = 'block';
        };
        reader.readAsText(file);
    }

}
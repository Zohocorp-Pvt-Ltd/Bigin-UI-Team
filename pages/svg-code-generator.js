const svgGeneratorContent= `<div class="p20">
    <div class="page-title mB10">SVG Code Generator with Preview</div>
    <div style="display: flex; flex-direction: column;">
        <div class="drop-area" id="drop-area">
            <p>Drag & drop an SVG file here, or click to upload</p>
            <input type="file" id="file-input" accept=".svg" style="display: none;" />
        </div>

        <div style="display: flex; flex-direction: column;position: relative;">
            <div style="display: flex;justify-content: space-between;align-items: center;">
                <div style="font-weight: 600;">Generated Code:</div>
                <div id="copyToClipboard" style="display: none;" class="copy-to-clipboard">Copy</div>
                <button id="saveToIconsFile" class="copy-to-clipboard" style="margin-top: 10px;">
                    Save to Icons File
                </button>
            </div>
            <textarea class="svg-ouput" id="output" readonly></textarea>
        </div>

        <div class="preview" id="preview-container" style="display: none;">
            <strong>Live Preview:</strong><br />
            <svg style="margin-top: 1rem;" id="symbol-preview">
                <use href=""></use>
            </svg>
        </div>
    </div>
</div>`

function initiateSVGCodeGenerator() {
        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('file-input');
        const output = document.getElementById('output');
        const preview = document.getElementById('symbol-preview');
        const copyToClipboard = document.getElementById('copyToClipboard');
        const previewUse = preview.querySelector('use');
        const saveToIconsFile = document.getElementById('saveToIconsFile');

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
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'image/svg+xml') {
                processSVG(file);
            }
        });

        fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file && file.type === 'image/svg+xml') {
                processSVG(file);
            }
        });

        copyToClipboard.addEventListener('click', () => {
            navigator.clipboard.writeText(document.getElementById('output').value).then(() => {
                alert('Code copied to clipboard!');
            })
        });

        saveToIconsFile.addEventListener('click', async () => {
            var svgCode = output.value;
            svgCode += `//update-here`; // Placeholder for appending to icons file
            var updatedIconSVG = `const uxIconsHTML = \`${uxIconsHTML.replace('//add-here', svgCode)}\``;
            updatedIconSVG = updatedIconSVG.replace('//update-here', '//add-here\n\n'); // Remove placeholder
            uploadFileToGitHub(updatedIconSVG);
});

        function processSVG(file) {
            const reader = new FileReader();
            reader.onload = () => {
                const svgText = reader.result;
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgText, 'image/svg+xml');
                const svg = doc.querySelector('svg');
                if (!svg) return alert('Invalid SVG');

                const viewBox = svg.getAttribute('viewBox') || '0 0 24 24';
                const idBase = file.name.replace(/\.svg$/i, '').replace(/\W+/g, '_');

                const gId = `${idBase}_ref`;
                const symbolId = `${idBase}`;

                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttribute("id", gId);
                g.setAttribute("fill", 'none');
                g.innerHTML = svg.innerHTML;

                const serializer = new XMLSerializer();
                var gCode = serializer.serializeToString(g);

                // ❌ Remove any xmlns="http://www.w3.org/2000/svg"
                gCode = gCode.replace(/\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '');

                const symbolCode = `
<symbol viewBox="${viewBox}" id="${symbolId}">
    <use href="#${gId}"></use>
</symbol>`.trim();

                output.value = `${gCode}\n\n${symbolCode}\n\n`;

                // Clear existing svgContainer if any
                let svgContainer = document.getElementById('defs-container');
                if (svgContainer) {
                    svgContainer.remove();
                }

                // Inject <g> and <symbol> for preview
                svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svgContainer.setAttribute("style", "display: none;");
                svgContainer.setAttribute("id", "defs-container");
                svgContainer.innerHTML = `${gCode}\n${symbolCode}`;
                document.body.appendChild(svgContainer);

                preview.setAttribute("viewBox", viewBox);
                previewUse.setAttribute("href", `#${symbolId}`);
                document.querySelector('#preview-container').style.display = 'block';
                document.querySelector('#copyToClipboard').style.display = 'block';
            };
            reader.readAsText(file);
        }
}
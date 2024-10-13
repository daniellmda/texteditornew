class Toolbar {
    constructor(contentInstance) {
        this.contentInstance = contentInstance;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.filename = document.getElementById('filename');
        this.fileSelect = document.getElementById('fileOperation');
        this.formatSelect = document.getElementById('formatBlock');
        this.fontSizeSelect = document.getElementById('fontSize');
        this.colorInput = document.getElementById('foreColor');
        this.bgColorInput = document.getElementById('hiliteColor');
        this.buttons = document.querySelectorAll('.btn-toolbar button');
        this.showCodeBtn = document.getElementById('show-code');
        this.fontPicker = document.getElementById('fontPicker');
    }

    attachEventListeners() {
        this.fileSelect.addEventListener('change', (e) => this.handleFileOperation(e.target.value));
        this.formatSelect.addEventListener('change', (e) => this.formatDoc('formatBlock', e.target.value));
        this.fontSizeSelect.addEventListener('change', (e) => this.formatDoc('fontSize', e.target.value));
        this.colorInput.addEventListener('input', (e) => this.formatDoc('foreColor', e.target.value));
        this.bgColorInput.addEventListener('input', (e) => this.formatDoc('hiliteColor', e.target.value));
        this.fontPicker.addEventListener('change', (e) => this.changeFont(e.target.value));
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                const command = button.getAttribute('data-command');
                if (command === 'createLink') {
                    this.addLink();
                } else if (command === 'showCode') {
                    this.toggleCode();
                } else if (command) {
                    this.formatDoc(command);
                }
            });
        });
    }

    
    formatDoc(command, value = null) {
        document.execCommand(command, false, value);
    }

    handleFileOperation(operation) {
        switch (operation) {
            case 'new':
                this.contentInstance.setContent('');
                this.filename.value = 'untitled';
                break;
            case 'txt':
                this.saveAsText();
                break;
            case 'pdf':
                this.saveAsPDF();
                break;
        }
        this.fileSelect.selectedIndex = 0;
    }
    changeFont(fontFamily) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.fontFamily = fontFamily;
            
            if (range.toString().trim() === '') {
                // If no text is selected, apply the font to the entire content
                this.contentInstance.element.style.fontFamily = fontFamily;
            } else {
                // If text is selected, wrap it in a span with the new font
                range.surroundContents(span);
            }
        } else {
            // If no selection, apply the font to the entire content
            this.contentInstance.element.style.fontFamily = fontFamily;
        }
    }

    handleFileOperation(operation) {
        switch (operation) {
            case 'new':
                this.contentInstance.setContent('');
                this.filename.value = 'untitled';
                break;
            case 'txt':
                this.saveAsText();
                break;
            case 'pdf':
                this.saveAsPDF();
                break;
            case 'open':
                this.openFile();
                break;
        }
        this.fileSelect.selectedIndex = 0;
    }
    
    openFile() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt';
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.contentInstance.setContent(e.target.result);
                    this.filename.value = file.name.replace('.txt', ''); // Удаляем расширение
                };
                reader.readAsText(file);
            }
        };
        fileInput.click();
    }
    
    saveAsText() {
        const blob = new Blob([this.contentInstance.getContent()]);
        const url = URL.createObjectURL(blob);
        this.downloadFile(url, `${this.filename.value}.txt`);
    }

    saveAsPDF() {
        const filename = `${this.filename.value}.pdf`;
        const element = this.contentInstance.element;
        const opt = {
            margin:       1,
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
         // Use Promise
         html2pdf().set(opt).from(element).save();
        }
    

    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    }

    toggleCode() {
        this.showCodeBtn.dataset.active = this.showCodeBtn.dataset.active === 'true' ? 'false' : 'true';
        this.contentInstance.toggleCodeView();
    }

    addLink() {
        const url = prompt('Insert url');
        this.formatDoc('createLink', url);
    }
}

class Content {
    constructor() {
        this.element = document.getElementById('content');
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.element.addEventListener('mouseenter', () => this.handleLinks());
    }

    handleLinks() {
        const links = this.element.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.element.setAttribute('contenteditable', 'false');
                link.target = '_blank';
            });
            link.addEventListener('mouseleave', () => {
                this.element.setAttribute('contenteditable', 'true');
            });
        });
    }

    toggleCodeView() {
        if (this.element.getAttribute('contenteditable') === 'true') {
            this.element.textContent = this.element.innerHTML;
            this.element.setAttribute('contenteditable', 'false');
        } else {
            this.element.innerHTML = this.element.textContent;
            this.element.setAttribute('contenteditable', 'true');
        }
    }

    setContent(content) {
        this.element.innerHTML = content;
    }

    getContent() {
        return this.element.innerText;
    }
}

class TextEditor {
    constructor() {
        this.content = new Content();
        this.toolbar = new Toolbar(this.content);
    }
}

// Initialize the Text Editor
const textEditor = new TextEditor();
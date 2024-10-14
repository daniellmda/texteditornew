// Класс Toolbar отвечает за панель инструментов редактора текста
class Toolbar {
    constructor(contentInstance) {
        this.contentInstance = contentInstance; // Экземпляр класса Content для работы с текстом
        this.initializeElements(); // Инициализация элементов панели инструментов
        this.attachEventListeners(); // Присоединение обработчиков событий
    }

    // Метод для инициализации HTML-элементов панели инструментов
    initializeElements() {
        this.filename = document.getElementById('filename'); // Поле для ввода имени файла
        this.fileSelect = document.getElementById('fileOperation'); // Выпадающий список операций с файлами
        this.formatSelect = document.getElementById('formatBlock'); // Выпадающий список форматирования текста
        this.fontSizeSelect = document.getElementById('fontSize'); // Выпадающий список изменения размера шрифта
        this.colorInput = document.getElementById('foreColor'); // Поле для выбора цвета текста
        this.bgColorInput = document.getElementById('hiliteColor'); // Поле для выбора цвета фона текста
        this.buttons = document.querySelectorAll('.btn-toolbar button'); // Кнопки панели инструментов
        this.showCodeBtn = document.getElementById('show-code'); // Кнопка для переключения режима кода
        this.fontPicker = document.getElementById('fontPicker'); // Выпадающий список для выбора шрифта
    }

    // Метод для добавления событий на элементы
    attachEventListeners() {
        this.fileSelect.addEventListener('change', (e) => this.handleFileOperation(e.target.value)); // Выбор операций с файлами
        this.formatSelect.addEventListener('change', (e) => this.formatDoc('formatBlock', e.target.value)); // Форматирование текста
        this.fontSizeSelect.addEventListener('change', (e) => this.formatDoc('fontSize', e.target.value)); // Изменение размера шрифта
        this.colorInput.addEventListener('input', (e) => this.formatDoc('foreColor', e.target.value)); // Изменение цвета текста
        this.bgColorInput.addEventListener('input', (e) => this.formatDoc('hiliteColor', e.target.value)); // Изменение цвета фона
        this.fontPicker.addEventListener('change', (e) => this.changeFont(e.target.value)); // Изменение шрифта
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                const command = button.getAttribute('data-command'); // Получаем команду из атрибута кнопки
                if (command === 'createLink') {
                    this.addLink(); // Добавление ссылки
                } else if (command === 'showCode') {
                    this.toggleCode(); // Переключение режима отображения кода
                } else if (command) {
                    this.formatDoc(command); // Применение команды форматирования
                }
            });
        });
    }

    // Метод для форматирования текста с использованием команды execCommand
    formatDoc(command, value = null) {
        document.execCommand(command, false, value); // Выполняем команду редактирования текста
    }

    // Обработка выбранной операции с файлом
    handleFileOperation(operation) {
        switch (operation) {
            case 'new':
                this.contentInstance.setContent(''); // Создание нового файла
                this.filename.value = 'untitled'; // Назначение имени файла по умолчанию
                break;
            case 'txt':
                this.saveAsText(); // Сохранение файла как .txt
                break;
            case 'pdf':
                this.saveAsPDF(); // Сохранение файла как .pdf
                break;
        }
        this.fileSelect.selectedIndex = 0; // Сброс выбора в выпадающем списке
    }

    // Изменение шрифта текста
    changeFont(fontFamily) {
        const selection = window.getSelection(); // Получаем выделенный текст
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0); // Получаем диапазон выделения
            const span = document.createElement('span'); // Создаем элемент <span>
            span.style.fontFamily = fontFamily; // Применяем выбранный шрифт

            if (range.toString().trim() === '') {
                // Если текст не выделен, применяем шрифт ко всему контенту
                this.contentInstance.element.style.fontFamily = fontFamily;
            } else {
                // Если текст выделен, оборачиваем его в <span> с новым шрифтом
                range.surroundContents(span);
            }
        } else {
            // Если текст не выделен, применяем шрифт ко всему контенту
            this.contentInstance.element.style.fontFamily = fontFamily;
        }
    }

    // Метод для открытия файла
    openFile() {
        const fileInput = document.createElement('input'); // Создаем элемент для выбора файла
        fileInput.type = 'file';
        fileInput.accept = '.txt'; // Принимаем только файлы .txt
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader(); // Читаем файл с помощью FileReader
                reader.onload = (e) => {
                    this.contentInstance.setContent(e.target.result); // Устанавливаем содержимое файла в редактор
                    this.filename.value = file.name.replace('.txt', ''); // Удаляем расширение из имени файла
                };
                reader.readAsText(file); // Чтение файла в текстовом формате
            }
        };
        fileInput.click(); // Открываем диалоговое окно выбора файла
    }

    // Сохранение файла как текстового
    saveAsText() {
        const blob = new Blob([this.contentInstance.getContent()]); // Создаем Blob с содержимым редактора
        const url = URL.createObjectURL(blob); // Создаем ссылку на этот Blob
        this.downloadFile(url, `${this.filename.value}.txt`); // Загружаем файл
    }

    // Сохранение файла как PDF
    saveAsPDF() {
        const filename = `${this.filename.value}.pdf`;
        const element = this.contentInstance.element; // Получаем элемент контента
        const opt = {
            margin: 1,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        // Используем библиотеку html2pdf для создания PDF
        html2pdf().set(opt).from(element).save();
    }

    // Загрузка файла по ссылке
    downloadFile(url, filename) {
        const link = document.createElement('a'); // Создаем элемент <a> для загрузки файла
        link.href = url;
        link.download = filename;
        link.click(); // Нажимаем на ссылку для начала загрузки
    }

    // Переключение режима отображения кода (WYSIWYG или HTML)
    toggleCode() {
        this.showCodeBtn.dataset.active = this.showCodeBtn.dataset.active === 'true' ? 'false' : 'true';
        this.contentInstance.toggleCodeView(); // Переключаем режим просмотра кода
    }

    // Добавление ссылки в текст
    addLink() {
        const url = prompt('Insert url'); // Запрашиваем URL у пользователя
        this.formatDoc('createLink', url); // Применяем команду создания ссылки
    }
}

// Класс Content управляет содержимым редактора
class Content {
    constructor() {
        this.element = document.getElementById('content'); // Получаем элемент редактора
        this.attachEventListeners(); // Присоединяем события
    }

    // Присоединение событий для обработки ссылок
    attachEventListeners() {
        this.element.addEventListener('mouseenter', () => this.handleLinks()); // Наведение мыши на контент
    }

    // Обработка ссылок внутри редактора
    handleLinks() {
        const links = this.element.querySelectorAll('a'); // Находим все ссылки в редакторе
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.element.setAttribute('contenteditable', 'false'); // Отключаем редактирование при наведении на ссылку
                link.target = '_blank'; // Открываем ссылку в новой вкладке
            });
            link.addEventListener('mouseleave', () => {
                this.element.setAttribute('contenteditable', 'true'); // Включаем редактирование при уходе мыши
            });
        });
    }

    // Переключение между режимом кода и текстом
    toggleCodeView() {
        if (this.element.getAttribute('contenteditable') === 'true') {
            this.element.textContent = this.element.innerHTML; // Показ HTML
            this.element.setAttribute('contenteditable', 'false');
        } else {
            this.element.innerHTML = this.element.textContent; // Показ форматированного текста
            this.element.setAttribute('contenteditable', 'true');
        }
    }

    // Установка содержимого редактора
    setContent(content) {
        this.element.innerHTML = content;
    }

    // Получение текста из редактора
    getContent() {
        return this.element.innerText;
    }
}

// Класс TextEditor объединяет панель инструментов и контент
class TextEditor {
    constructor() {
        this.content = new Content(); // Создаем экземпляр класса Content
        this.toolbar = new Toolbar(this.content); // Создаем экземпляр Toolbar и связываем с Content
    }
}

// Инициализация текстового редактора
const textEditor = new TextEditor();

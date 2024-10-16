// Класс Content отвечает за основное содержимое редактора текста
class Content {
    constructor() {
        this.element = document.getElementById('content'); // Элемент редактора
        this.currentMatchIndex = -1; // Индекс текущего найденного элемента
    }

    // Установка содержимого редактора
    setContent(content) {
        this.element.innerHTML = content; // Устанавливаем новое содержимое
    }

    // Получение содержимого редактора
    getContent() {
        return this.element.innerHTML; // Возвращаем текущее содержимое
    }

    // Переключение режима просмотра кода
    toggleCodeView() {
        if (this.element.isContentEditable) {
            this.element.contentEditable = false; // Отключаем редактирование
            this.element.style.border = 'none'; // Убираем границу
        } else {
            this.element.contentEditable = true; // Включаем редактирование
            this.element.style.border = '1px solid #ccc'; // Включаем границу
        }
    }
}

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
        this.searchInput = document.getElementById('searchInput'); // Поле для поиска
        this.replaceInput = document.getElementById('replaceInput'); // Поле для замены
        this.prevButton = document.getElementById('prevButton'); // Кнопка "предыдущий"
        this.nextButton = document.getElementById('nextButton'); // Кнопка "следующий"
        this.replaceButton = document.getElementById('replaceButton'); // Кнопка замены
        this.replaceAllButton = document.getElementById('replaceAllButton'); // Кнопка замены всех
    }

    // Метод для добавления событий на элементы
    attachEventListeners() {
        this.fileSelect.addEventListener('change', (e) => this.handleFileOperation(e.target.value)); // Выбор операций с файлами
        this.formatSelect.addEventListener('change', (e) => this.formatDoc('formatBlock', e.target.value)); // Форматирование текста
        this.fontSizeSelect.addEventListener('change', (e) => this.formatDoc('fontSize', e.target.value)); // Изменение размера шрифта
        this.colorInput.addEventListener('input', (e) => this.formatDoc('foreColor', e.target.value)); // Изменение цвета текста
        this.bgColorInput.addEventListener('input', (e) => this.formatDoc('hiliteColor', e.target.value)); // Изменение цвета фона
        this.fontPicker.addEventListener('change', (e) => this.changeFont(e.target.value)); // Изменение шрифта
        this.prevButton.addEventListener('click', () => this.findText('prev')); // Обработка нажатия на "предыдущий"
        this.nextButton.addEventListener('click', () => this.findText('next')); // Обработка нажатия на "следующий"
        this.replaceButton.addEventListener('click', () => this.replaceText(false)); // Обработка нажатия на замену
        this.replaceAllButton.addEventListener('click', () => this.replaceText(true)); // Обработка нажатия на замену всех
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
        let contentText = this.contentInstance.element.textContent; // Получаем текст без HTML
        contentText = contentText.trim(); // Удаляем пробелы в начале и в конце текста
        const blob = new Blob([contentText], { type: 'text/plain' }); // Создаем Blob с текстом
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
        if (url) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                const fontFamily = window.getComputedStyle(this.contentInstance.element).fontFamily;
                const fontSize = window.getComputedStyle(this.contentInstance.element).fontSize;
                const color = window.getComputedStyle(this.contentInstance.element).color;
    
                // Применяем текущие стили к span
                span.style.fontFamily = fontFamily;
                span.style.fontSize = fontSize;
                span.style.color = color;
    
                document.execCommand('createLink', false, url); // Добавляем ссылку
    
                const link = range.startContainer.parentNode; // Получаем элемент ссылки
                link.style.fontFamily = fontFamily;
                link.style.fontSize = fontSize;
                link.style.color = color;
            }
        }}

    // Метод поиска текста
   // Метод поиска текста
   findText(direction) {
    const searchTerm = this.searchInput.value;
    let content = this.contentInstance.getContent();

    // Сброс выделения
    content = content.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
    this.contentInstance.setContent(content);

    if (searchTerm) {
        const regex = new RegExp(searchTerm, 'gi');
        const matches = [...content.matchAll(regex)];

        if (matches.length > 0) {
            // Инициализация текущего индекса
            if (this.contentInstance.currentMatchIndex === undefined) {
                this.contentInstance.currentMatchIndex = direction === 'prev' ? matches.length - 1 : 0;
            } else {
                // Изменение индекса в зависимости от направления
                if (direction === 'next') {
                    this.contentInstance.currentMatchIndex = (this.contentInstance.currentMatchIndex + 1) % matches.length;
                } else if (direction === 'prev') {
                    this.contentInstance.currentMatchIndex = (this.contentInstance.currentMatchIndex - 1 + matches.length) % matches.length;
                }
            }

            const currentIndex = this.contentInstance.currentMatchIndex;
            const start = matches[currentIndex].index;
            const end = start + searchTerm.length;

            const highlightedContent = content.substring(0, start) +
                `<span class="highlight">${content.substring(start, end)}</span>` +
                content.substring(end);

            this.contentInstance.setContent(highlightedContent);

            const highlightedElement = this.contentInstance.element.querySelector('.highlight');
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            // Оповещение, если совпадений не найдено
            alert('Совпадений не найдено');
        }
    } else {
        // Оповещение, если поисковый запрос пуст
        alert('Введите текст для поиска');
    }
}




    // Метод замены текста
// Метод замены текста
replaceText(replaceAll) {
    const searchTerm = this.searchInput.value;
    const replaceTerm = this.replaceInput.value;
    const content = this.contentInstance.getContent(); // Получаем текущее содержимое

    // Сброс выделения
    this.contentInstance.setContent(content.replace(/<span class="highlight">(.*?)<\/span>/g, '$1'));

    if (replaceAll) {
        // Замена всех вхождений, игнорируя регистр
        const newContent = content.replace(new RegExp(searchTerm, 'gi'), replaceTerm);
        this.contentInstance.setContent(newContent); // Устанавливаем новое содержимое
    } else {
        // Замена только первого вхождения, игнорируя регистр
        const newContent = content.replace(new RegExp(searchTerm, 'i'), replaceTerm);
        this.contentInstance.setContent(newContent); // Устанавливаем новое содержимое
    }
}
}   

// Инициализация редактора
const contentInstance = new Content(); // Создаем экземпляр класса Content
const toolbar = new Toolbar(contentInstance); // Создаем экземпляр класса Toolbar

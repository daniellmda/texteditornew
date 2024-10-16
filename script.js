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
            this.element.textContent = this.element.innerHTML;  // Если режим редактирования активен, показываем HTML-код
            this.element.contentEditable = false; // Выключаем режим редактирования
            this.element.style.border = 'none';   // Убираем рамку
        } else {
            this.element.innerHTML = this.element.textContent; // Если режим редактирования выключен, показываем отформатированный текст
            this.element.contentEditable = true; // Включаем режим редактирования
            this.element.style.border = '1px solid #ccc'; // Добавляем рамку для индикации редактирования
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
        this.fileInput = document.createElement('input'); // Скрытый элемент для выбора файла (input type="file")
        this.fileInput.type = 'file'; // Тип input - файл
        this.fileInput.accept = '.txt'; // Ограничение выбора файлов текстовыми файлами
        this.fileInput.style.display = 'none';  // Прячем элемент
        document.body.appendChild(this.fileInput); // Добавляем input в тело документа
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
        this.fileSelect.addEventListener('change', (e) => this.handleFileOperation(e.target.value)); // Обработчик выбора операции с файлами
        this.fileInput.addEventListener('change', (e) => this.handleFileOpen(e)); // Обработка открытия файла
        this.replaceAllButton.addEventListener('click', () => this.replaceText(true)); // Обработка нажатия на замену всех
        // Обработчики событий для кнопок панели инструментов
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

    // Обработка выбранной операции с файлом (новый, открыть, сохранить как текст или PDF)
    handleFileOperation(operation) {
        switch (operation) {
            case 'new':
                this.contentInstance.setContent(''); // Очищаем контент для нового файла
                this.filename.value = 'untitled'; // Устанавливаем имя по умолчанию
                break;
            case 'txt':
                this.saveAsText(); // Сохраняем как текст
                break;
            case 'open':
                this.openFile(); // Открываем файл
                break;
            case 'pdf':
                this.saveAsPDF(); // Сохраняем как PDF
                break;
        }
        this.fileSelect.selectedIndex = 0; // Сбрасываем выбор в выпадающем списке
    }

    openFile() {
        this.fileInput.click(); // Имитируем нажатие на input для выбора файла
    }

    // Обработка загруженного файла
    handleFileOpen(event) {
        const file = event.target.files[0]; // Получаем файл
        if (file) {
            const reader = new FileReader(); // Создаем FileReader для чтения файла
            reader.onload = (e) => {
                this.contentInstance.setContent(e.target.result); // Загружаем содержимое файла в редактор
                this.filename.value = file.name.replace('.txt', '');  // Устанавливаем имя файла без расширения
            };
            reader.readAsText(file); // Читаем файл как текст
        }
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


    // Сохранение а как текстового
    saveAsText() {
        let contentText = this.contentInstance.element.textContent; // Получаем текст без HTML
        contentText = contentText.trim(); // Удаляем пробелы в начале и в конце текста
        const blob = new Blob([contentText], { type: 'text/plain' }); // Создаем Blob с текстом
        const url = URL.createObjectURL(blob); // Создаем ссылку на этот Blob
        this.downloadFile(url, `${this.filename.value}.txt`); // Загружаем файл
    }



    // Сохранение файла как PDF
    saveAsPDF() {
        const filename = `${this.filename.value}.pdf`; // Устанавливаем имя файла
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

    // Загрузка файла
    downloadFile(url, filename) {
        const link = document.createElement('a'); // Создаем элемент <a> для загрузки файла
        link.href = url; // Устанавливаем ссылку на файл
        link.download = filename; // Устанавливаем имя файла
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
        if (url) { // Проверяем, ввёл ли пользователь URL
            const selection = window.getSelection(); // Получаем текущее выделение текста
            if (selection.rangeCount > 0) { // Проверяем, есть ли выделенный текст
                const range = selection.getRangeAt(0); // Получаем диапазон выделения
                const span = document.createElement('span'); // Создаем элемент <span> для стилей
                const fontFamily = window.getComputedStyle(this.contentInstance.element).fontFamily; // Получаем текущий шрифт
                const fontSize = window.getComputedStyle(this.contentInstance.element).fontSize; // Получаем текущий размер шрифта
                const color = window.getComputedStyle(this.contentInstance.element).color; // Получаем текущий цвет текста

                // Применяем текущие стили к span
                span.style.fontFamily = fontFamily;
                span.style.fontSize = fontSize;
                span.style.color = color;

                document.execCommand('createLink', false, url); // Добавляем ссылку

                const link = range.startContainer.parentNode; // Получаем элемент ссылки
                link.style.fontFamily = fontFamily;  // Применяем шрифт к ссылке
                link.style.fontSize = fontSize; // Применяем размер шрифта к ссылке
                link.style.color = color; // Применяем цвет текста к ссылке
            }
        }
    }


    // Метод поиска текста
    findText(direction) {
        const searchTerm = this.searchInput.value; // Получаем поисковый запрос
        let content = this.contentInstance.getContent();  // Получаем текст контента

        // Сброс выделения
        content = content.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
        this.contentInstance.setContent(content); // Устанавливаем обновленный контент

        if (searchTerm) { // Проверяем, если поисковый запрос не пустой
            const regex = new RegExp(searchTerm, 'gi'); // Создаем регулярное выражение для поиска
            const matches = [...content.matchAll(regex)]; // Находим все совпадения

            if (matches.length > 0) {  // Если найдены совпадения
                // Инициализация текущего индекса
                if (this.contentInstance.currentMatchIndex === undefined) {
                    // Если направление поиска "предыдущий", начинаем с последнего совпадения
                    this.contentInstance.currentMatchIndex = direction === 'prev' ? matches.length - 1 : 0;
                } else {
                    // Изменение индекса в зависимости от направления
                    if (direction === 'next') {
                        this.contentInstance.currentMatchIndex = (this.contentInstance.currentMatchIndex + 1) % matches.length;
                    } else if (direction === 'prev') {
                        this.contentInstance.currentMatchIndex = (this.contentInstance.currentMatchIndex - 1 + matches.length) % matches.length;
                    }
                }

                const currentIndex = this.contentInstance.currentMatchIndex; // Текущий индекс совпадения
                const start = matches[currentIndex].index; // Начальная позиция совпадения
                const end = start + searchTerm.length; // Конечная позиция совпадения
                // Создаем новый контент с выделенным совпадением
                const highlightedContent = content.substring(0, start) +
                    `<span class="highlight">${content.substring(start, end)}</span>` +
                    content.substring(end);
                // Обновляем контент с выделением
                this.contentInstance.setContent(highlightedContent);

                const highlightedElement = this.contentInstance.element.querySelector('.highlight');  // Находим выделенный элемент
                if (highlightedElement) {
                    // Прокручиваем к выделенному элементу с плавным скроллингом
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
        const searchTerm = this.searchInput.value; // Получаем текст для поиска
        const replaceTerm = this.replaceInput.value; // Получаем текст для замены
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

class TabManager {
    constructor() {
        this.tabButtonsContainer = document.getElementById('tab-buttons'); // Получаем контейнер для вкладок
        this.contentElement = document.getElementById('content');  // Получаем элемент для отображения содержимого вкладки
        this.addTabButton = document.getElementById('add-tab-btn');  // Получаем кнопку для добавления новой вкладки
        this.tabs = {}; // Массив для хранения всех вкладок
        this.currentTab = null;  // Переменная для отслеживания активной вкладки
        this.tabCounter = 0; // Счётчик для уникальных имен вкладок
        // Добавляем обработчик событий для кнопки добавления новой вкладки

        this.addTabButton.addEventListener('click', () => this.addTab());
        this.addTab(); // Создаем первую вкладку автоматически
    }
    // Метод для добавления новой вкладки

    addTab() {
        this.tabCounter += 1; // Увеличиваем счётчик вкладок
        const tabId = `tab-${this.tabCounter}`; // Создаем уникальный идентификатор вкладки

        // Создаем кнопку вкладки
        const tabButton = document.createElement('button');
        tabButton.textContent = `Tab ${this.tabCounter}`; // Название кнопки вкладки
        tabButton.dataset.tabId = tabId;  // Устанавливаем идентификатор вкладки в атрибут data-tab-id
        // Добавляем обработчики событий для переключения и редактирования имени вкладки
        tabButton.addEventListener('click', () => this.switchTab(tabId));
        tabButton.addEventListener('dblclick', (e) => this.editTabName(e, tabId));
        this.tabButtonsContainer.appendChild(tabButton); // Добавляем кнопку вкладки в контейнер    

        // Сохраняем пустое содержимое для новой вкладки
        this.tabs[tabId] = '';

        // Автоматически переключаемся на новую вкладку
        this.switchTab(tabId);
    }
    // Метод для переключения между вкладками

    switchTab(tabId) {
        if (this.currentTab) {
            // Сохраняем текущее содержимое перед переключением
            this.tabs[this.currentTab] = this.contentElement.innerHTML;
        }

        // Активируем выбранную вкладку
        this.contentElement.innerHTML = this.tabs[tabId];
        this.currentTab = tabId; // Устанавливаем новую активную вкладку

        // Обновляем стили кнопок вкладок
        const buttons = this.tabButtonsContainer.getElementsByTagName('button');
        for (let button of buttons) {
            if (button.dataset.tabId === tabId) {
                button.classList.add('active');  // Добавляем класс активной вкладке
            } else {
                button.classList.remove('active'); // Убираем класс с неактивных вкладок
            }
        }
    }
    // Метод для редактирования имени вкладки
    editTabName(event, tabId) {
        const button = event.target; // Получаем кнопку вкладки, на которой был выполнен двойной клик
        const input = document.createElement('input'); // Создаем поле ввода
        input.type = 'text';
        input.value = button.textContent; // Устанавливаем текущее имя вкладки в поле ввода
        input.classList.add('edit-tab-name'); // Добавляем класс для стилизации поля ввода
        // Функция для сохранения нового имени вкладки

        const saveNewName = () => {
            button.textContent = input.value; // Устанавливаем новое имя для кнопки вкладки
            button.style.display = ''; // Отображаем кнопку вкладки
            input.remove(); // Удаляем поле ввода
        };
        // Сохраняем новое имя вкладки, когда фокус уходит с поля ввода
        input.addEventListener('blur', saveNewName);
        // Сохраняем новое имя при нажатии клавиши "Enter"
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveNewName();
            }
        });
        // Скрываем кнопку вкладки и заменяем её полем ввода
        button.style.display = 'none';
        button.parentNode.insertBefore(input, button); // Вставляем поле ввода перед кнопкой
        input.focus();  // Устанавливаем фокус на поле ввода
    }
}

// Инициализация
//document.addEventListener('DOMContentLoaded', () => {
const tabManager = new TabManager();
//});
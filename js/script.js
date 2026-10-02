const CARS_URL = './cars.json';

const carsSelect = document.querySelector('#cars-select');
const statusMessage = document.querySelector('#status');
const carInfo = document.querySelector('#car-info');
const carTitle = document.querySelector('#car-title');
const carBrand = document.querySelector('#car-brand');
const carModel = document.querySelector('#car-model');
const carPrice = document.querySelector('#car-price');
const retryButton = document.querySelector('#retry-button');

let cars = [];

// Вывод сообщения пользователю
const showStatus = (message, type = 'info') => {
    statusMessage.textContent = message;
    statusMessage.className = `status status--${type}`;
    statusMessage.hidden = false;
};

// Скрываем информацию об автомобиле
const hideCarInfo = () => {
    carInfo.hidden = true;
};

// Показываем информацию об автомобиле
const showCarInfo = (car) => {
    carTitle.textContent = `${car.brand} ${car.model}`;
    carBrand.textContent = car.brand;
    carModel.textContent = car.model;
    carPrice.textContent = new Intl.NumberFormat('ru-RU').format(car.price);

    carInfo.hidden = false;
};

// Проверяем полученные данные
const validateCars = (data) => {
    if (!data || !Array.isArray(data.cars)) {
        throw new Error('Сервер вернул данные в неправильном формате.');
    }

    const validCars = data.cars.filter((car) =>
        car &&
        typeof car.brand === 'string' &&
        typeof car.model === 'string' &&
        (typeof car.price === 'number' || typeof car.price === 'string')
    );

    if (validCars.length === 0) {
        throw new Error('В полученных данных нет автомобилей.');
    }

    return validCars;
};

// Выводим автомобили в SELECT
const renderCars = () => {
    carsSelect.replaceChildren();

    cars.forEach((car, index) => {
        const option = document.createElement('option');

        option.value = index;
        option.textContent = `${car.brand} ${car.model}`;

        carsSelect.append(option);
    });

    carsSelect.disabled = false;

    // Показываем первый автомобиль
    carsSelect.value = '0';
    showCarInfo(cars[0]);

    showStatus(
        `Загружено автомобилей: ${cars.length}.`,
        'success'
    );
};

// Получаем автомобили из JSON
const loadCars = async () => {
    carsSelect.disabled = true;
    retryButton.hidden = true;

    hideCarInfo();

    showStatus(
        'Загружаем данные об автомобилях...',
        'info'
    );

    try {
        const response = await fetch(CARS_URL);

        // Проверяем HTTP-ошибку
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        // Получаем JSON
        const data = await response.json();

        // Проверяем полученные данные
        cars = validateCars(data);

        // Показываем автомобили
        renderCars();

    } catch (error) {
        console.error(
            'Не удалось загрузить автомобили:',
            error
        );

        carsSelect.replaceChildren();

        const option = document.createElement('option');

        option.value = '';
        option.textContent = 'Данные недоступны';

        carsSelect.append(option);

        carsSelect.disabled = true;

        hideCarInfo();

        showStatus(
            'Не удалось загрузить данные об автомобилях. ' +
            'Проверьте файл cars.json и попробуйте ещё раз.',
            'error'
        );

        retryButton.hidden = false;
    }
};

// Выбор автомобиля
carsSelect.addEventListener('change', () => {
    const selectedIndex = Number(carsSelect.value);
    const selectedCar = cars[selectedIndex];

    if (!Number.isInteger(selectedIndex) || !selectedCar) {
        hideCarInfo();

        showStatus(
            'Не удалось найти выбранный автомобиль.',
            'error'
        );

        return;
    }

    showCarInfo(selectedCar);
});

// Повторная загрузка данных
retryButton.addEventListener('click', loadCars);

// Загружаем автомобили при открытии страницы
loadCars();
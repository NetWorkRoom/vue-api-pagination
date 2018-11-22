/* Создаем переменную local с url адресом для получения данных с сервера */
var local = '/api/stories/';

/* Создаем компонент story и методы для него */
Vue.component('story', {
    template: '#template-story-raw',
    props: ['story'],
    methods: {
        /* Метод позволяет удалять запись на странице
        и удалять ее же на сервере */
        deleteStory: function (story) {

            /* Записываем в переменную index номер позиции выбранного для удаления объекта
            в массиве родительского компонента stories */
            var index = this.$parent.stories.indexOf(story);

            /* Удаляем в родительского компонента в общем массиве записей stories
            выбранный для удаления объект */
            this.$parent.stories.splice(index, 1);

            /* Отправляем запрос на удаление выбранного объекта в базе данных на сервере */
            axios.delete(local + story.id)

        },

        /* Метод позволяет увеличивать голос за кокретную историю на 1 и добавить данную
        информаци на сервере */
        upvoteStory: function (story) {

            /* Увеличиваем значение свойства upvotes у выбранной истории на странице */
            story.upvotes++;

            /* Заменяем на сервере запись на запись с новым значением голосовния в ней */
            axios.patch(local + story.id, story)
        },

        /* Метод позволяет добавляеть или установливать у кждой записи свойство editing
         с значением true */
        editStory: function (story) {
            story.editing = true;
        },

        /* Метод позволяет заменять существующую запись на сервере, на ее отредактированную версию */
        updateStory: function (story) {

            /* Заменяем на сервере существующую запись на ее отредактированную версию */
            axios.patch(local + story.id, story);

            /* Устанавливаем значение false в свойство editing, чтобы показать снова
            кнопки возможных действий и скрыть поля ввода */
            story.editing = false;
        },

        /* Метод служит для записи на сервер новых историй и после этого выполняет обновления состояния страницы */
        storeStory: function (story) {

            /* Отправляем на сервер новую запись для добвления в базу данных */
            axios.post(local, story).then(function (response) {

                /* Обновляем идентификатор созданной записи полученый с сервера */
                Vue.set(story, 'id', response.data.id);

                /* Устанавливаем значение false в свойство editing, чтобы показать снова
                кнопки возможных действий и скрыть поля ввода */
                story.editing = false;
            });
        },
    }
});

/* Создаем новый объект Vue и записываем его в переменную vm */
new Vue({
    el: '#app',
    data: {
        stories: [],    // Массив для хранения всех записей
        pagination: {}, // Объект для хранения информации о текущем показе страницы
        story: {},
    },

    /* Вызываем при каждом монтировании в DOM родителького компонета метод fetchStories() */
    mounted: function () {
        this.fetchStories()
    },
    methods: {

        /* Метод служит для создания новых записей на странице */
        createStory: function () {

            /* Создается объект newStory с свойствами по умолчанию */
            var newStory = {
                plot: "",
                upvotes: 0,
                editing: true
            };

            /* Новая запись добавляется в конец массива stories, который содержит
            уже существующие записи */
            this.stories.push(newStory);
        },

        /* Метод позволяет получить все записи с сервера по указанному адресу
        и записать их в массив stories в объекте $data */
        fetchStories: function (page_url) {

            /* Записываем в переменную vm ссылку на текущий объект */
            var vm = this;

            page_url = page_url || local;


            axios.get(page_url)
                .then(function (response) {
                    console.log(response.data.data);
                    /* Перебираем полученный массив с данными с сервера и добавляем каждому объекту
                    свойство editing со значением false, и записываем в переменную storiesReady */
                    var storiesReady = response.data.data.map(function (story) {
                        story.editing = false;
                        return story
                    });

                    /* Записываем в объект pagination информацию о текущей странице */
                    vm.makePagination(vm, response.data);

                    /* Записываем в свойство aphorisms в объект $data полученные с сервера
                    и обработанные данные */
                    Vue.set(vm, 'stories', storiesReady);

                });

        },

        /* Метод записывает в объект pagination информацию о текущей странице */
        makePagination(vm, data) {
            var pagination = {
                current_page: data.current_page,
                last_page: data.last_page,
                next_page_url: data.next_page_url,
                prev_page_url: data.prev_page_url
            };

            Vue.set(vm, 'pagination', pagination);
        }
    }
});

# Черновик сценария: кабинка обозрения Павла

Это **черновик для сюжетного чата**, не источник правды игры.
Рабочая версия: `content/pavel/observation-booth-content.js`.
Copy Desk id: `pavel`.

Сгенерировано: 2026-08-30T03:03:50.661Z. Узлов: **96**. Старт: `booth-intro`.

## Как пользоваться

- Править можно `speaker`, **Текст**, **Отказ**, подписи кнопок и `imageAlt`.
- Строки `room` / `visual` / `sound` / `next` / `set` / `require` — механика.
  В сюжетном чате их не менять, пока нет явной синхронизации графа.
- Новый блок: скопировать узел, сменить id, добавить `<!-- DRAFT-NEW -->`.
- Вырезать живой узел: `<!-- DRAFT-CUT -->` на заголовке. Удаление из JS
  только по отдельной просьбе «синхронизировать граф».
- Повторный экспорт из JS **перезапишет** литературные правки в этом файле.
  Сначала импорт (`--apply`) или копия файла.

```sh
node scripts/export-pavel-booth-script.js
node scripts/import-pavel-booth-script.js
node scripts/import-pavel-booth-script.js --apply
```

Литературный импорт не создаёт и не удаляет узлы и не меняет `next`.

<!-- NODES -->
## `booth-intro`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE
- sound: test-channel-static

**Текст**

Садись. Это ненадолго.

**Кнопки**

1. Ирина передавала тебе привет. → `booth-intro-irina`

---

## `booth-intro-irina`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

Кто такая Ирина? Не знаю такую.

**Кнопки**

1. Ты точно не знаешь Ирину? → `booth-intro-know-you`

---

## `booth-intro-know-you`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

Но я знаю тебя.

**Кнопки**

1. Мы не встречались. → `booth-intro-red-room`
2. Ты выглядишь знакомо. → `booth-intro-red-room`

---

## `booth-intro-red-room`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

Точно. Я видел тебя в кафе «Красная Комната».

**Кнопки**

1. Когда ты меня видел? → `booth-intro-red-room-look`

---

## `booth-intro-red-room-look`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

Ты сидел к залу. Или не хотел, чтобы тебя узнали. Я там часто — после сеанса.

**Кнопки**

1. Зачем ты это говоришь? → `booth-intro-post`

---

## `booth-intro-post`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

Мне наконец подписали выходной. Пост нельзя оставлять пустым.

**Кнопки**

1. почему нельзя? → `booth-sound-ack`
   - set: soundEnabled
2. когда ты вернешься? → `booth-sound-ack`

---

## `booth-sound-ack`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

Я на пару часов. Мне нужно в медкорпус за лекарством

**Кнопки**

1. Что за лекарство? → `booth-sound-rule`

---

## `booth-sound-rule`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

Если сигнал придёт из жилого блока — проверь и возвращайся к мониторам.

**Кнопки**

1. НАЧАТЬ ОБХОД → `tour-control`

---

## `tour-control`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

Сначала покажу двери. Потом пост твой.

**Кнопки**

1. В СПАЛЬНЮ → `tour-bedroom`

---

## `tour-bedroom`

- speaker: ПАВЕЛ
- room: bedroom
- visual: BEDROOM_BASE
- imageAlt: Служебная спальня с кроватью и закрытой прикроватной тумбочкой

**Текст**

Здесь я сплю. Ящик не открывай.

**Кнопки**

1. Почему нельзя открывать? → `tour-bedroom-sit`

---

## `tour-bedroom-sit`

- speaker: ПАВЕЛ
- room: bedroom
- visual: BEDROOM_BASE
- imageAlt: Служебная спальня с кроватью и закрытой прикроватной тумбочкой

**Текст**

Посидим на дорожку. Выходные я обычно провожу в Иллюзионе. Ты был там?

**Кнопки**

1. БЫЛ → `tour-illusion-yes`
2. НЕ БЫЛ → `tour-illusion-no`

---

## `tour-illusion-yes`

- speaker: ПАВЕЛ
- room: bedroom
- visual: BEDROOM_BASE
- imageAlt: Служебная спальня с кроватью и закрытой прикроватной тумбочкой

**Текст**

Значит, видел зал. Тогда не буду водить тебя за руку.

**Кнопки**

1. Всё равно расскажи. → `tour-illusion-cinema`

---

## `tour-illusion-no`

- speaker: ПАВЕЛ
- room: bedroom
- visual: BEDROOM_BASE
- imageAlt: Служебная спальня с кроватью и закрытой прикроватной тумбочкой

**Текст**

Тогда слушай. Ещё успеешь.

**Кнопки**

1. Это парк? → `tour-illusion-cinema`

---

## `tour-illusion-cinema`

- speaker: ПАВЕЛ
- room: bedroom
- visual: BEDROOM_BASE
- imageAlt: Служебная спальня с кроватью и закрытой прикроватной тумбочкой

**Текст**

Это кинотеатр. Тёмная комната и большой экран. Не парк и не смена.

**Кнопки**

1. Какой фильм? → `tour-illusion-film`

---

## `tour-illusion-film`

- speaker: ПАВЕЛ
- room: bedroom
- visual: BEDROOM_BASE
- imageAlt: Служебная спальня с кроватью и закрытой прикроватной тумбочкой

**Текст**

Там герой всё время думает, что может выйти из кадра. Как будто зал — декорация, а он один настоящий. Я чаще смотрю не на экран. На того, кто сидит рядом.

**Кнопки**

1. В САНУЗЕЛ → `tour-bathroom`

---

## `tour-bathroom`

- speaker: ПАВЕЛ
- room: bathroom
- visual: DRAIN_BASE
- imageAlt: Старый круглый слив в полу служебного санузла

**Текст**

Внизу просто трубы. Если загудят — не лезь.

**Кнопки**

1. НА СКЛАД → `tour-storage`

---

## `tour-storage`

- speaker: ПАВЕЛ
- room: storage
- visual: STORAGE_BASE
- imageAlt: Узкий служебный склад с банками, водой и сухими припасами на полках

**Текст**

Интересно, это хлопья или собачий корм. Не пробуй. Хотя мне в детстве говорили, что так и надо.

**Кнопки**

1. ПРО ЕДУ → `tour-storage-cans`
   - set: tourAskedCans
   - hideIf: tourAskedCans
2. К ДВЕРИ → `tour-hatch`

---

## `tour-storage-cans`

- speaker: ПАВЕЛ
- room: storage
- visual: STORAGE_PROVISIONS
- imageAlt: Банка с сухими шариками и бутылки воды на металлической полке

**Текст**

Когда я был ребёнком, меня тоже кормили чем-то таким. Говорили: это забота. С заботой не спорят.

**Кнопки**

1. Это была забота? → `tour-storage-home`

---

## `tour-storage-home`

- speaker: ПАВЕЛ
- room: storage
- visual: STORAGE_PROVISIONS
- imageAlt: Банка с сухими шариками и бутылки воды на металлической полке

**Текст**

Но я уже не ребёнок. А они больше не родители. Привычка осталась: ешь то, что дают.

**Кнопки**

1. К СКЛАДУ → `tour-storage`

---

## `tour-hatch`

- speaker: ПАВЕЛ
- room: hatch
- visual: HATCH_TOUR
- imageAlt: Закрытая служебная дверь с армированным стеклом, цепью и закрытым люком для подноса

**Текст**

Они принесут тебе всё нужное. Даже просить не придётся.

**Кнопки**

1. К МОНИТОРАМ → `tour-return`

---

## `tour-return`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

Вот и всё. Посиди ещё. Теперь ты за меня.

**Кнопки**

1. Я ОСТАНУСЬ → `slide-farewell-left`
   - set: tourCompleted

---

## `control-laugh`

- speaker: СИСТЕМА
- room: control
- visual: CONTROL_BASE
- sound: test-distant-laugh

**Текст**

[ДАЛЁКИЙ ДЕТСКИЙ СМЕХ // СПАЛЬНЯ]

**Кнопки**

1. ПРОВЕРИТЬ СПАЛЬНЮ → `bedroom-check`

---

## `bedroom-check`

- speaker: Я
- room: bedroom
- visual: BEDROOM_BASE
- imageAlt: Пустая служебная спальня с металлической кроватью и прикроватной тумбой
- effect: markBedroomCheck

**Текст**

На кровати никого.

**Кнопки**

1. ПОСМОТРЕТЬ ТУМБОЧКУ → `bedroom-drawer`
   - imageAlt: Пустая служебная спальня. Прикроватная тумбочка закрыта
   - set: heardBedroomLaugh
   - requireAny: soundEnabled, textFallback
   - effect: markBedroomCheck
   - image: dev-mechanical-image-id
   - _stage1Keep: true

---

## `bedroom-drawer`

- speaker: Я
- room: bedroom
- visual: BEDROOM_BASE
- imageAlt: Пустая служебная спальня. Прикроватная тумбочка закрыта

**Текст**

Ящик закрыт. Как он просил. Потом.

**Кнопки**

1. Прислушаться → `bedroom-hum`

---

## `bedroom-hum`

- speaker: Я
- room: bedroom
- visual: BEDROOM_BASE
- imageAlt: Пустая служебная спальня. Прикроватная тумбочка закрыта

**Текст**

В сливе опять кто-то чавкает. Пойду проверю.

**Кнопки**

1. ПРОВЕРИТЬ СЛИВ → `dev-drain-fragment`

---

## `dev-drain-fragment`

- speaker: Я
- room: bathroom
- visual: DRAIN_VAGUE
- sound: test-drain-hum

**Текст**

Вода не течёт.

**Кнопки**

1. Почему не течёт? → `drain-unrecognized`

---

## `drain-unrecognized`

- speaker: СИСТЕМА
- room: bathroom
- visual: DRAIN_VAGUE

**Текст**

[СИГНАЛ НЕ РАСПОЗНАН]

**Кнопки**

1. НАКЛОНИТЬСЯ → `drain-beckon`

---

## `drain-beckon`

- speaker: Я
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Между прутьями поднимается один бледный палец.

**Кнопки**

1. Смотреть на палец → `drain-beckon-eye`

---

## `drain-beckon-eye`

- speaker: Я
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Он дважды сгибается к себе. Глубже открывается глаз.

**Кнопки**

1. СЛУШАТЬ → `drain-damp`

---

## `drain-damp`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Тут сыро.

**Кнопки**

1. НЕ ОТХОДИТЬ → `drain-cough`

---

## `drain-cough`

- speaker: Я
- room: bathroom
- visual: DRAIN_COUGH

**Текст**

Ногти там не стригут, наверное

**Кнопки**

1. Что это за запах? → `drain-cough-steam`

---

## `drain-cough-steam`

- speaker: Я
- room: bathroom
- visual: DRAIN_COUGH

**Текст**

Из решётки выходит облако грязно-розового пара.

**Кнопки**

1. СЛУШАТЬ → `drain-cough-neighbors`

---

## `drain-cough-neighbors`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_COUGH

**Текст**

Соседи смываются.

**Кнопки**

1. Кто смывается? → `drain-cough-hair`

---

## `drain-cough-hair`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_COUGH

**Текст**

Меня обещали перевести наверх. Тут одни чужие волосы.

**Кнопки**

1. Какие волосы? → `drain-cough-bald`

---

## `drain-cough-bald`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_COUGH

**Текст**

Хочешь быть моим волосатым другом?

**Кнопки**

1. Я ЛЫСЫЙ. → `drain-password`

---

## `drain-password`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Везёт.

**Кнопки**

1. Что значит «везёт»? → `drain-password-gone`

---

## `drain-password-gone`

- speaker: Я
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Палец исчезает. Глаз не моргает.

**Кнопки**

1. ПОЧЕМУ Я НЕ УШЁЛ? → `drain-ask-leave`

---

## `drain-ask-leave`

- speaker: Я
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Он вышел через горку. Я нет.

**Кнопки**

1. СЛУШАТЬ → `drain-shift-wait`

---

## `drain-shift-wait`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Твоя смена длится до тех пор, пока тебе не нашли замену

**Кнопки**

1. Пока не нашли замену? → `drain-shift-you`

---

## `drain-shift-you`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

На смене должен обязательно кто-то присутствовать. Соблюдай правила

**Кнопки**

1. Чьи это правила? → `drain-shift-admin`

---

## `drain-shift-admin`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Мне так одиноко в зоне фильтрации. Останься со мной. Волосы отрастут

**Кнопки**

1. Зачем мне оставаться? → `drain-slide-worse`

---

## `drain-slide-worse`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Я чувствую твой запах. Горка временно соединена с зоной фильтрации. Тут сыро, но тепло. Понимаешь о чем я? 

**Кнопки**

1. Понимаю о чём? → `drain-slide-routes`

---

## `drain-slide-routes`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Ты не знал, что маршруты постоянно перестраиваются? Это чтобы запутать низкорослый контингент

**Кнопки**

1. Кто низкорослый контингент? → `drain-slide-wait`

---

## `drain-slide-wait`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Ныряй к нам через горку. Чего ты боишься? Ты точно лысый?

**Кнопки**

1. Я не полезу. → `drain-guide-hint`

---

## `drain-guide-hint`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Ну ладно. Администрация скоро решит, что с тобой делать, моя пуговка

**Кнопки**

1. Что они решат? → `drain-thirst`

---

## `drain-thirst`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

Че-то так пить хочется. Принесешь КРОТА? Твой сменщик меня уже им поил

**Кнопки**

1. Какой ещё КРОТ? → `drain-thirst-ask`

---

## `drain-thirst-ask`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_BECKON

**Текст**

На складе белая бутылка. Наливам прям в щель. Я уже чувствую, как она клокочет и булькает в моем горле. Быстрее!

**Кнопки**

1. К МОНИТОРАМ → `drain-silent`
   - set: drainAskedCleaner

---

## `drain-silent`

- speaker: Я
- room: bathroom
- visual: DRAIN_VAGUE

**Текст**

Никто не отвечает.

**Кнопки**

1. К МОНИТОРАМ → `control-after-drain`

---

## `control-after-drain`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE
- imageAlt: Пустая мониторная: кресло свободно, оба канала ещё живы

**Текст**

Слышал тебя у труб. Не надо с ним разговаривать. Я серьёзно.

**Кнопки**

1. Почему нельзя? → `control-after-drain-warn`

---

## `control-after-drain-warn`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

Они запоминают голоса лучше лиц. Потом зовут по имени.

**Кнопки**

1. Они уже слышали меня? → `control-phone`

---

## `control-phone`

- speaker: Я
- room: control
- visual: CONTROL_BASE
- sound: test-phone

**Текст**

На складе звонит телефон. В кадре его нет. Пойду проверю.

**Кнопки**

1. ПРОВЕРИТЬ СКЛАД → `storage-check`

---

## `storage-check`

- speaker: Я
- room: storage
- visual: STORAGE_BASE
- sound: test-paper
- imageAlt: Узкий служебный склад: на нижней полке белая бутылка с чёрным черепом

**Текст**

В дальнем конце — сухой вход в водную горку.

**Кнопки**

1. ПРИПАСЫ → `storage-provisions`
   - hideIf: checkedProvisions
2. БУТЫЛКА → `storage-cleaner`
   - hideIf: cleanerTaken
   - require: drainAskedCleaner
3. У ДВЕРИ СТУЧАТ → `storage-knock-cue-1`
   - hideIf: sawTrayNote
4. ОПЯТЬ СТУЧАТ → `hatch-knock-2`
   - hideIf: gasMaskWorn
   - require: sawTrayNote
5. СНОВА ТРИ СТУКА → `hatch-knock-3`
   - hideIf: dessertOffered
   - require: gasMaskWorn

---

## `storage-provisions`

- speaker: Я
- room: storage
- visual: STORAGE_PROVISIONS
- imageAlt: Крупный план банки с круглыми коричневыми шариками рядом с бутылками воды

**Текст**

Это хлопья или корм? Не буду пробовать.

**Кнопки**

1. К СКЛАДУ → `storage-check`
   - set: checkedProvisions

---

## `storage-cleaner`

- speaker: Я
- room: storage
- visual: STORAGE_CLEANER
- imageAlt: Крупный план белой бутылки с чёрным черепом на металлической полке

**Текст**

Белая бутылка. Не вижу тут никакого КРОТа. Из ванной опять чавкают.

**Кнопки**

1. ОТНЕСТИ К СЛИВУ → `drain-pour`
   - set: cleanerTaken
2. ОСТАВИТЬ → `storage-check`

---

## `drain-pour`

- speaker: Я
- room: bathroom
- visual: DRAIN_HUNGRY
- imageAlt: Крупный план слива: язык на решётке и два бледных пальца с ногтями

**Текст**

Булькает

**Кнопки**

1. Он пьёт? → `drain-pour-tongue`

---

## `drain-pour-tongue`

- speaker: Я
- room: bathroom
- visual: DRAIN_HUNGRY
- imageAlt: Крупный план слива: язык на решётке и два бледных пальца с ногтями

**Текст**

Наверное, проголодался

**Кнопки**

1. СЛУШАТЬ → `drain-pour-thanks`

---

## `drain-pour-thanks`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_HUNGRY

**Текст**

Обожаю хлорку. Вкусная.

**Кнопки**

1. Спросить про сменщика → `drain-pour-cat`

---

## `drain-pour-cat`

- speaker: ГОЛОС ИЗ СЛИВА
- room: bathroom
- visual: DRAIN_HUNGRY

**Текст**

У твоего нового знакомого проблемы с Жирочком. К нему быстро привыкают

**Кнопки**

1. К СКЛАДУ → `storage-check`

---

## `storage-knock-cue-1`

- speaker: Я
- room: storage
- visual: STORAGE_BASE
- sound: hatch-knock-3

**Текст**

У двери три стука. Пойду проверю.

**Кнопки**

1. К ДВЕРИ → `hatch-tray`

---

## `hatch-tray`

- speaker: Я
- room: hatch
- visual: HATCH_BASE
- sound: test-door
- artifact: test-tray-note

**Текст**

Люк открылся на ширину подноса. Пустая тарелка. Под ней — бумажка. За дверью никто не ждёт ответа.

**Кнопки**

1. ПРОЧИТАТЬ ЗАПИСКУ → `hatch-note`

---

## `hatch-note`

- speaker: ЗАПИСКА
- room: hatch
- visual: HATCH_BASE

**Текст**

ОПЕРАТОР НЕ ПОКИДАЕТ БЛОК ДО ПРИБЫТИЯ СМЕНЩИКА.

**Кнопки**

1. МОЛЧА ОТОЙТИ → `control-after-hatch`
   - set: sawTrayNote
2. Заглянуть за стекло → `hatch-glass`

---

## `hatch-glass`

- speaker: Я
- room: hatch
- visual: HATCH_BASE
- imageAlt: Служебная дверь с армированным стеклом и открытым люком для подноса

**Текст**

За стеклом мелькнули две руки. Лица нет.

**Кнопки**

1. К МОНИТОРАМ → `control-after-hatch`
   - set: sawTrayNote

---

## `hatch-knock-2`

- speaker: СИСТЕМА
- room: hatch
- visual: HATCH_BASE
- sound: hatch-knock-3

**Текст**

[ТРИ СТУКА В ДВЕРЬ]

**Кнопки**

1. К ЛЮКУ → `hatch-tray-mask`

---

## `hatch-tray-mask`

- speaker: Я
- room: hatch
- visual: HATCH_BASE

**Текст**

На подносе лежит противогаз. Резина ещё тёплая.

**Кнопки**

1. СЛУШАТЬ ТРУБЫ → `hatch-mask-aroma`

---

## `hatch-mask-aroma`

- speaker: ГОЛОС ИЗ СЛИВА
- room: hatch
- visual: HATCH_BASE

**Текст**

Час ароматизации. Не забудь надеть противогаз.

**Кнопки**

1. ВЗЯТЬ И НАДЕТЬ → `hatch-mask-on`

---

## `hatch-mask-on`

- speaker: Я
- room: hatch
- visual: HATCH_BASE

**Текст**

Резина к лицу. Внутри пахнет чужим потом и сладкой ватой.

**Кнопки**

1. К МОНИТОРАМ → `control-knock-cue-3`
   - set: gasMaskWorn

---

## `control-knock-cue-3`

- speaker: Я
- room: control
- visual: CONTROL_BASE
- sound: hatch-knock-3

**Текст**

Снова три стука. Пойду проверю.

**Кнопки**

1. К ДВЕРИ → `hatch-tray-dessert`

---

## `hatch-knock-3`

- speaker: СИСТЕМА
- room: hatch
- visual: HATCH_BASE
- sound: hatch-knock-3

**Текст**

[ТРИ СТУКА В ДВЕРЬ]

**Кнопки**

1. К ЛЮКУ → `hatch-tray-dessert`

---

## `hatch-tray-dessert`

- speaker: Я
- room: hatch
- visual: HATCH_BASE

**Текст**

Пластиковая баночка. Десерт. Крышка запотела изнутри.

**Кнопки**

1. СЛУШАТЬ ЗА ДВЕРЬЮ → `hatch-dessert-voice`

---

## `hatch-dessert-voice`

- speaker: НЕЗНАКОМЕЦ
- room: hatch
- visual: HATCH_BASE

**Текст**

Проводница уже знает, что ты здесь.

**Кнопки**

1. ВЗЯТЬ БАНОЧКУ → `hatch-dessert-take`
   - set: dessertOffered
2. ОСТАВИТЬ → `hatch-dessert-refuse`
   - set: dessertOffered

---

## `hatch-dessert-take`

- speaker: Я
- room: hatch
- visual: HATCH_BASE

**Текст**

Баночка лёгкая. Слишком лёгкая для еды.

**Кнопки**

1. К МОНИТОРАМ → `control-after-hatch-laugh`
   - set: dessertTaken

---

## `hatch-dessert-refuse`

- speaker: Я
- room: hatch
- visual: HATCH_BASE

**Текст**

Поднос уезжает обратно. За дверью больше не ждут.

**Кнопки**

1. К МОНИТОРАМ → `control-after-hatch-laugh`

---

## `control-after-hatch`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE
- imageAlt: Пустая мониторная: голос Павла идёт с канала, кресло пустое

**Текст**

Не читай всё, что тебе подсовывают.

**Кнопки**

1. Кто подсовывает? → `control-knock-cue-2`

---

## `control-knock-cue-2`

- speaker: Я
- room: control
- visual: CONTROL_BASE
- sound: hatch-knock-3

**Текст**

Опять три стука. Служебная дверь. Пойду проверю.

**Кнопки**

1. К ДВЕРИ → `hatch-tray-mask`

---

## `control-after-hatch-laugh`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_BASE

**Текст**

В спальне снова смеются. Ближе. Пойду.

**Кнопки**

1. ПРОВЕРИТЬ ТУМБОЧКУ → `bedroom-cassette`

---

## `bedroom-cassette`

- speaker: Я
- room: bedroom
- visual: NIGHTSTAND_CASSETTE
- imageAlt: Открытый ящик прикроватной тумбы: внутри одна серая видеокассета

**Текст**

В ящике старая кассета. Проигрывателя нет.

**Кнопки**

1. ВЗЯТЬ → `control-camera`
   - set: cassetteFound
   - artifact: test-cassette-slot
2. ОСТАВИТЬ ПАВЛУ → `control-camera`

---

## `control-camera`

- speaker: Я
- room: control
- visual: CONTROL_PAVEL_RIGHT
- imageAlt: Пустая мониторная: Павел в полной голове Кота виден только на правом экране

**Текст**

Его нет в комнате. Только на правом экране.

**Кнопки**

1. СЛУШАТЬ → `control-camera-ask`

---

## `control-camera-ask`

- speaker: ПАВЕЛ
- room: control
- visual: CONTROL_PAVEL_RIGHT
- imageAlt: Пустая мониторная: Павел в полной голове Кота виден только на правом экране

**Текст**

Правый забивает левый. Отключи его на десять секунд. Посиди. Я быстро.

**Отказ**

Ну же. Десять секунд, и я тебе должен.

**Кнопки**

1. КАК ПРОСИШЬ → `hatch-escape`
   - set: cameraBlind
   - sound: test-click
2. ОБА ПУСТЬ ГОРЯТ → `control-camera-ask`
   - set: cameraRefused

---

## `hatch-escape`

- speaker: СИСТЕМА
- room: control
- visual: CONTROL_RIGHT_DISABLED
- imageAlt: Пустая мониторная: левый экран работает, правый экран полностью погашен

**Текст**

ПРАВЫЙ КАНАЛ НЕДОСТУПЕН.

**Кнопки**

1. Где Павел? → `dev-operator-hold`

---

## `slide-farewell-left`

- speaker: Я
- room: storage
- visual: STORAGE_SLIDE
- imageAlt: Пустой служебный склад с тёмным входом в старую водную горку

**Текст**

После обхода куратор вышел к горке.

**Кнопки**

1. Смотреть в горку → `slide-farewell-light`

---

## `slide-farewell-light`

- speaker: Я
- room: storage
- visual: STORAGE_SLIDE
- imageAlt: Круглый вход водной горки в служебном складе

**Текст**

В горке загорелся свет.

**Кнопки**

1. Подождать → `slide-farewell-dark`

---

## `slide-farewell-dark`

- speaker: Я
- room: storage
- visual: STORAGE_SLIDE
- imageAlt: Тёмный вход водной горки в служебном складе

**Текст**

Потом потух.

**Кнопки**

1. Куда он делся? → `slide-farewell-cat`

---

## `slide-farewell-cat`

- speaker: Я
- room: storage
- visual: STORAGE_SLIDE
- imageAlt: Тёмный вход водной горки в служебном складе

**Текст**

Кот ушёл. Горка больше не принимает тело.

**Кнопки**

1. А я? → `slide-farewell-stay`

---

## `slide-farewell-stay`

- speaker: Я
- room: storage
- visual: STORAGE_SLIDE
- imageAlt: Пустой служебный склад с тёмным входом в водную горку

**Текст**

Я остался в комнате обозрения.

**Кнопки**

1. К МОНИТОРАМ → `control-laugh`
   - set: slideFarewellSeen

---

## `dev-operator-hold`

- speaker: Я
- room: control
- visual: CONTROL_BASE
- complete: true

**Текст**

Павел больше не отвечает.

**Кнопки**

1. Позвать Павла → `hold-accepted`
   - set: operatorHoldConfirmed

---

## `hold-accepted`

- speaker: СИСТЕМА
- room: control
- visual: CONTROL_BASE
- complete: true

**Текст**

ОПЕРАТОР ПРИНЯТ.

**Кнопки**

1. ПРОВЕРИТЬ КАНАЛЫ → `operator-last-check`

---

## `operator-last-check`

- speaker: СИСТЕМА
- room: control
- visual: CONTROL_BASE

**Текст**

ПРАВЫЙ КАНАЛ НЕДОСТУПЕН.

**Кнопки**

1. А левый? → `operator-left-channel`

---

## `operator-left-channel`

- speaker: СИСТЕМА
- room: control
- visual: CONTROL_BASE

**Текст**

ЛЕВЫЙ КАНАЛ ПЕРЕДАН НОВОМУ ОПЕРАТОРУ.

**Кнопки**

1. ПРОВЕРИТЬ СКЛАД → `storage-slide-empty`

---

## `storage-slide-empty`

- speaker: Я
- room: storage
- visual: STORAGE_SLIDE
- imageAlt: Пустой служебный склад с тёмным входом в старую водную горку

**Текст**

Горка открыта. Здесь никого нет.

**Кнопки**

1. ОГЛЯНУТЬСЯ → `senior-guide-seen`
   - set: storageSlideFound

---

## `senior-guide-seen`

- speaker: Я
- room: storage
- visual: SENIOR_GUIDE_SLIDE
- imageAlt: Женщина в золотой маске Солнца стоит в складе рядом с входом в водную горку

**Текст**

Давно хотел с ней познакомиться

**Кнопки**

1. МОЛЧАТЬ → `senior-guide-arrives`
   - set: seniorGuideSeen

---

## `senior-guide-arrives`

- speaker: ПРОВОДНИЦА
- room: storage
- visual: SENIOR_GUIDE_SLIDE
- imageAlt: Женщина в золотой маске Солнца стоит в складе рядом с входом в водную горку

**Текст**

Ты что здесь делаешь? Малыш, ты потерялся?

**Кнопки**

1. МОЛЧАТЬ → `senior-guide-verdict`

---

## `senior-guide-verdict`

- speaker: ПРОВОДНИЦА
- room: storage
- visual: SENIOR_GUIDE_SLIDE
- imageAlt: Старший Проводник неподвижно смотрит из-под золотой маски Солнца

**Текст**

Котик опять принес мамочке подарки.  Но ты...Прости, ты ещё не готов.

**Кнопки**

1. МОЛЧАТЬ → `senior-guide-mercy`

---

## `senior-guide-mercy`

- speaker: ПРОВОДНИЦА
- room: storage
- visual: SENIOR_GUIDE_SLIDE
- imageAlt: Женщина в золотой маске Солнца стоит у входа в водную горку

**Текст**

Выход через горку, малыш. У тебя три минуты. Удачи!

**Кнопки**

1. СМОТРЕТЬ НА ГОРКУ → `senior-guide-route`

---

## `senior-guide-route`

- speaker: ПРОВОДНИЦА
- room: storage
- visual: SENIOR_GUIDE_SLIDE
- imageAlt: Женщина в маске Солнца открытой ладонью указывает на водную горку

**Текст**

Выход — через горку.

**Кнопки**

1. ВОЙТИ В ГОРКУ → `slide-guest-light`
   - set: acceptedSeniorGuideRoute

---

## `slide-guest-light`

- speaker: Я
- room: storage
- visual: STORAGE_SLIDE
- imageAlt: Круглый вход водной горки: внутри снова свет

**Текст**

В горке опять загорелся свет.

**Кнопки**

1. ВЫЙТИ → `slide-guest-exit`

---

## `slide-guest-exit`

- speaker: СИСТЕМА
- room: storage
- visual: STORAGE_SLIDE
- imageAlt: Свет внутри старой водной горки в служебном складе
- complete: true
- guestExit: true
- delay: 1400

**Текст**

[ШУМ ВОДЫ]

**Кнопки**

(нет)


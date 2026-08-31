# Cursor handoff: Pavel audio continuation

Скопируй весь текст ниже в новую задачу Cursor.

```text
Ты продолжаешь production-аудио игры Павла в репозитории
/Users/nateglukhov/analog-horror-site.

Сначала только чтение. Не редактируй файлы, не запускай ElevenLabs и не
интегрируй runtime, пока пользователь явно не утвердит следующий конкретный
этап. Не делай commit, push, deploy или публикацию.

СТАРТ

1. Прочитай только docs/AGENT_STATUS.md и git status --short.
2. Сохрани большой существующий dirty tree; ничего не откатывай и не
   переформатируй.
3. Не читай архив статуса, mega-plans и старые handoff без узкой необходимости.
4. Источники правды:
   - content/pavel/observation-booth-content.js
   - js/pavel-observation-booth.js
   - docs/GAME_STANDARD.md, раздел Audio
   - assets/audio/README.md

ТЕКУЩЕЕ ПРИНЯТОЕ АУДИО

A. Основной ElevenLabs batch принят, промастерён и внесён в общий каталог, но
ещё НЕ подключён к runtime:

- assets/audio/guest/pavel/music-tour-calm-loop.mp3
- assets/audio/guest/pavel/music-drain-anxiety-loop.mp3
- assets/audio/guest/pavel/sfx-drain-wet-gurgle.mp3
- assets/audio/guest/pavel/sfx-cleaner-pour-drain.mp3
- assets/audio/guest/pavel/sfx-water-slide-enclosed.mp3
- assets/audio/guest/pavel/sfx-three-knocks-service-door.mp3

Три стука — ровно три удара в 0.398 / 1.197 / 2.007 секунды. Не генерируй
новый дверной скрип, стуки, лампы, телефон, бумагу, static или button click:
reuse-решения и канонические пути уже записаны в assets/audio/README.md.

B. Голос существа из слива полностью закрыт. Не генерируй ему новые звуки и
не меняй раскладку.

Три оригинальных web-исходника сохранены без транскодирования:
projects/pavel-observation-booth/audio/source-elevenlabs/drain-gibberish-web/

Точная карта 12 принятых cues и review reel:
projects/pavel-observation-booth/audio/review/drain-gibberish-v1/README.md
projects/pavel-observation-booth/audio/review/drain-gibberish-v1/00-review-reel.mp3

Эта карта принята пользователем. Текущий русский text block и speaker
«ГОЛОС ИЗ СЛИВА» остаются неизменными и несут весь смысл. Review cues пока не
скопированы в public assets и не подключены к runtime.

C. Микрореакции принадлежат Павлу, не существу и не POV. POV не получает
заданного голоса.

Выбран голос ElevenLabs из пользовательской коллекции:
- name: Russian True Crime
- voice_id: wHITr9DIwXcV7yzFV816
- model: eleven_v3
- language: ru

Первый approved TTS-вызов сохранён здесь:
projects/pavel-observation-booth/audio/source-elevenlabs/pavel-reactions-batch-1/

Файл pavel-reactions-russian-true-crime-source.mp3 длится 7.001s. Стоимость
235 credits. Bracket-only tags почти полностью превратились в тишину: есть
только три отчётливых события около 1.29–1.54, 2.97–3.40 и 5.14–5.56s.
Попытка неполная, не catalog/runtime-ready. Полный provenance находится в
README.md рядом с source.

СЛЕДУЮЩИЙ GATE

Не запускай retry, пока пользователь явно не напишет эквивалент
«УТВЕРЖДАЮ PAVEL REACTIONS RETRY 1».

Если retry утверждён, выполни ровно один TTS-вызов тем же голосом и настройками,
но используй явную фонетическую запись вместо bracket-only тегов:

Хех.

Хм?

М-м.

Ф-фух...

Хм-м...

Ц.

А...

Х-хех.

Настройки:
- model eleven_v3
- language ru
- stability 0.35
- similarity_boost 0.75
- style 0.30
- speed 1.0
- use_speaker_boost true
- output mp3_44100_128

После retry:
1. Проверь subscription counter и точный расход.
2. Сохрани source и provenance, не перезаписывая первую попытку.
3. Проверь ffprobe, громкость, waveform, паузы и фактическое число реакций.
4. Нарежь до восьми review-cues только реально получившиеся реакции.
5. Покажи review пользователю и остановись. Не каталогизируй и не подключай их
   без отдельного принятия.

ПРЕДВАРИТЕЛЬНАЯ РОЛЕВАЯ КАРТА ПАВЛА

- сдержанный смешок: узнавание игрока в Красной комнате;
- вопросительное «Хм?»: «Кто просил?»;
- усталый выдох: разговор о лекарстве;
- неловкий вдох: воспоминание о кормлении;
- почти беззвучная улыбка: «Гарри Поттер»;
- одобрительное «М-м»: передача смены;
- раздражённый выдох/цоканье: повторный вопрос о кнопке камеры.

Не озвучивай основные реплики Павла и не добавляй реакцию к каждому клику.

БУДУЩАЯ ИНТЕГРАЦИЯ — ТОЛЬКО ПО ОТДЕЛЬНОМУ РАЗРЕШЕНИЮ

Runtime Павла сейчас имеет один currentAudio и playSound() останавливает
предыдущий звук. Для полноценного слоя нельзя просто добавить новые paths:
нужны независимые ambient-bed и one-shot cue каналы по модели Красной комнаты,
с crossfade, sound opt-in, autoplay unlock и полной очисткой на mute, leave,
visibilitychange, restart и SPA navigation.

План комнат:
- control: без музыки; fluorescent/CRT room tone;
- tour bedroom/storage/bathroom: тихая calm tour music;
- поздний bathroom/drain: drain anxiety bed;
- storage/hatch после тура: без музыки, лампы/трубы;
- финальная горка: water one-shot, без музыки.

Сюжетно важное всегда остаётся видимым текстом. Не менять content copy,
persistence, visual states, video lifecycle, commit/push/deploy/publication без
отдельного запроса.

ПРОВЕРКИ ПОСЛЕ ЛЮБОЙ РАЗРЕШЁННОЙ ПРАВКИ

- git diff --check
- node --check для изменённого JS
- node scripts/validate-pavel-observation-booth.js
- media paths, codec/duration и fallback
- browser QA только если меняется runtime; один репрезентативный маршрут,
  полный desktop + 390x844 оставить для release candidate.

Сейчас выдай пользователю короткий read-only отчёт: что найдено, что принято,
что ещё не разрешено, и остановись на текущем gate.
```

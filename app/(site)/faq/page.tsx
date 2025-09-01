// app/faq/page.tsx
import Link from "next/link";

const PRODUCT = "Your Product Name";           // поменяй
const SUPPORT_EMAIL = "support@example.com";   // поменяй
const RETENTION_HOURS = 24;                    // сколько храните логи/ивенты (часов)

export const metadata = {
  title: `FAQ – ${PRODUCT}`,
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] text-[#e6e9f2]">
      <div className="max-w-4xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-semibold mb-6">FAQ (Частые вопросы)</h1>

        <div className="rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-6 space-y-6">
          {/* Что это */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Что это за сервис?</h2>
            <p className="opacity-90">
              {PRODUCT} — это веб-оверлей для стримов. Он генерирует живые задания/реплики с помощью ИИ и
              выводит их поверх трансляции. Поддерживаются OBS/Streamlabs через «Browser Source».
            </p>
          </section>

          {/* Поддерживаемые платформы */}
          <section>
            <h2 className="text-lg font-semibold mb-2">На каких платформах это работает?</h2>
            <p className="opacity-90">
              Оверлей работает там, где вы используете OBS/Streamlabs: Twitch, YouTube, Kick и др.
              Сам сервис не связан официально ни с одной из платформ.
            </p>
          </section>

          {/* Как подключить */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Как подключить к OBS/Streamlabs?</h2>
            <ol className="list-decimal ml-5 space-y-1 opacity-90">
              <li>На главной странице сгенерируйте ссылку оверлея (кнопка <b>Generate link</b>).</li>
              <li>Скопируйте ссылку и вставьте её в OBS/Streamlabs как <b>Browser Source</b>.</li>
              <li>Поставьте ширину/высоту под размер вашего канваса (например, 1920×1080).</li>
            </ol>
          </section>

          {/* Приватность (коротко) */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Что с данными и приватностью?</h2>
            <ul className="list-disc ml-5 space-y-1 opacity-90">
              <li>
                Логин/регистрация выполняются через Firebase Auth (Google). Мы не храним ваши пароли.
              </li>
              <li>
                Для работы оверлея временно храним технические данные (токен оверлея, последние задания/ивенты)
                в Redis (Upstash) до ~{RETENTION_HOURS} часов или пока очередь не будет очищена.
              </li>
              <li>
                Контент заданий создаётся ИИ (OpenAI). Мы не используем ваши данные для маркетинга/продаж.
              </li>
            </ul>
            <p className="opacity-80 mt-2 text-sm">
              Полные детали — в документах{" "}
              <Link href="/legal/privacy" className="underline hover:opacity-100 opacity-80">
                Privacy Policy
              </Link>{" "}
              и{" "}
              <Link href="/legal/terms" className="underline hover:opacity-100 opacity-80">
                Terms of Service
              </Link>.
            </p>
          </section>

          {/* Контент и возраст */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Возраст и правила контента</h2>
            <ul className="list-disc ml-5 space-y-1 opacity-90">
              <li>Сервис рассчитан на пользователей 13+.</li>
              <li>
                Запрещены: незаконный контент, NSFW, хейт/травля, опасные инструкции, нарушающие правила площадок.
              </li>
              <li>
                Вы несёте ответственность за контент на своём стриме. Соблюдайте правила Twitch/YouTube/Kick и т.п.
              </li>
            </ul>
          </section>

          {/* Стоимость/лимиты */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Стоимость и лимиты</h2>
            <p className="opacity-90">
              Текущие лимиты на частоту запросов к ИИ и ивенты оверлея могут применяться для стабильной работы сервиса.
              Детали тарифов/лимитов могут изменяться без предварительного уведомления.
            </p>
          </section>

          {/* Ответственность */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Ответственность</h2>
            <p className="opacity-90">
              Сервис предоставляется «как есть», без гарантий бесперебойности или соответствия конкретным целям.
              Мы не отвечаем за блокировки/санкции на платформах — модерация контента и соблюдение правил остаются за стримером.
              Полная юридическая версия — в{" "}
              <Link href="/legal/terms" className="underline hover:opacity-100 opacity-80">
                Terms of Service
              </Link>.
            </p>
          </section>

          {/* Поддержка */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Поддержка</h2>
            <p className="opacity-90">
              Пишите на <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.  
              Мы помогаем с подключением, вопросами по лимитам и безопасностью.
            </p>
          </section>
        </div>

        <p className="mt-6 text-xs opacity-60">
          Важно: этот FAQ — краткое резюме. Юридически обязательны{" "}
          <Link href="/legal/terms" className="underline">Terms of Service</Link> и{" "}
          <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
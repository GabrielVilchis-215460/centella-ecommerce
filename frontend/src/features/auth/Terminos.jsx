import { Link } from "react-router-dom"
import { Footer } from "../../components/layout/Footer"

export function Terminos() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">

      <main className="flex-1 max-w-3xl mx-auto w-full px-8 py-12 flex flex-col gap-8">
        <div>
          <Link
            to="/registro"
            className="font-body text-sm text-primary underline hover:text-aux transition-colors"
          >
            ← Volver al registro
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl text-text-dark">Términos y Condiciones</h1>
          <p className="font-body text-sm text-text-light">Última actualización: abril 2026</p>
        </div>

        <div className="flex flex-col gap-6 font-body text-base text-text-regular leading-relaxed">

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-xl text-text-dark">1. Aceptación de los términos</h2>
            <p>Al registrarte y utilizar la plataforma Centella, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguno de los términos aquí descritos, te pedimos que no utilices nuestros servicios. El uso continuo de la plataforma implica la aceptación de cualquier modificación futura a estos términos.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-xl text-text-dark">2. Descripción del servicio</h2>
            <p>Centella es una plataforma de comercio electrónico orientada a conectar a emprendedoras locales de Ciudad Juárez, Chihuahua, con clientes interesados en adquirir sus productos y servicios. La plataforma facilita la publicación de catálogos, la gestión de pedidos y el procesamiento de pagos en línea.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-xl text-text-dark">3. Registro y cuentas de usuario</h2>
            <p>Para acceder a las funcionalidades de Centella es necesario crear una cuenta. Al registrarte, te comprometes a proporcionar información verídica, completa y actualizada. Cada usuario puede tener únicamente una cuenta activa en la plataforma. El acceso a tu cuenta es personal e intransferible, y eres responsable de mantener la confidencialidad de tus credenciales.</p>
            <p>Centella se reserva el derecho de suspender o eliminar cuentas que incumplan estos términos, publiquen contenido fraudulento o realicen actividades que perjudiquen a otros usuarios de la plataforma.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-xl text-text-dark">4. Condiciones para emprendedoras</h2>
            <p>Las emprendedoras registradas en Centella se comprometen a operar dentro del territorio de Ciudad Juárez, Chihuahua, y a ofrecer únicamente productos y servicios que cumplan con la legislación mexicana vigente. La información publicada en sus perfiles y catálogos debe ser veraz y estar actualizada.</p>
            <p>Centella no se hace responsable por disputas entre emprendedoras y clientes derivadas de información incorrecta, productos defectuosos o incumplimiento en los tiempos de entrega. Es responsabilidad de la emprendedora mantener actualizado el estatus de sus pedidos.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-xl text-text-dark">5. Pagos y transacciones</h2>
            <p>Todos los pagos realizados a través de Centella son procesados por pasarelas de pago externas (Stripe, PayPal). Los precios se muestran en pesos mexicanos (MXN). Centella no almacena información bancaria de sus usuarios. Cualquier disputa relacionada con cargos no reconocidos debe ser reportada directamente al proveedor de pago correspondiente.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-xl text-text-dark">6. Insignia "Hecho en Juárez"</h2>
            <p>La insignia "Hecho en Juárez" es otorgada exclusivamente por los administradores de Centella a emprendedoras cuyos productos sean elaborados localmente en Ciudad Juárez. Su asignación queda a criterio del equipo administrativo y puede ser revocada en caso de comprobarse información falsa sobre el origen de los productos.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-xl text-text-dark">7. Reseñas y calificaciones</h2>
            <p>Solo los usuarios que hayan completado una transacción podrán dejar reseñas sobre los productos, servicios o emprendedoras involucradas. Centella se reserva el derecho de eliminar reseñas que contengan lenguaje ofensivo, información falsa o que incumplan las políticas de la plataforma.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-xl text-text-dark">8. Privacidad y protección de datos</h2>
            <p>Centella recopila y almacena información personal de sus usuarios con el único propósito de operar la plataforma. No compartimos ni vendemos datos personales a terceros. Toda la comunicación entre el navegador y nuestros servidores está cifrada mediante HTTPS. Para más información sobre el manejo de tus datos, puedes contactarnos directamente.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-xl text-text-dark">9. Modificaciones a los términos</h2>
            <p>Centella se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán notificados a los usuarios registrados mediante correo electrónico y entrarán en vigor a los 15 días de su publicación. El uso continuo de la plataforma después de dicho plazo implica la aceptación de los nuevos términos.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-xl text-text-dark">10. Contacto</h2>
            <p>Si tienes dudas sobre estos Términos y Condiciones puedes contactarnos a través de nuestros canales oficiales. Haremos nuestro mejor esfuerzo por responderte en un plazo no mayor a 72 horas hábiles.</p>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  )
}
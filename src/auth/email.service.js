const nodemailer = require("nodemailer");

async function sendResetPasswordEmail(email, resetUrl) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || "correoproy.pruebas@gmail.com";

  const html = `
        <div style="
        font-family: Arial, sans-serif;
        background-color: #F5F5F4;
        padding: 40px 20px;
        ">

        <div style="
            max-width: 600px;
            margin: auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        ">

            <div style="
            background: #1E3A5F;
            padding: 30px;
            text-align: center;
            ">
            <h1 style="
                color: white;
                margin: 0;
                letter-spacing: 2px;
            ">
                MY SPACE
            </h1>

            <p style="
                color: #D4A373;
                margin-top: 8px;
                font-size: 14px;
            ">
                Massage Therapy
            </p>
            </div>

            <div style="padding: 40px;">

            <h2 style="
                color: #1E3A5F;
                margin-top: 0;
            ">
                Recuperación de contraseña
            </h2>

            <p style="
                color: #555;
                line-height: 1.6;
            ">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
            </p>

            <p style="
                color: #555;
                line-height: 1.6;
            ">
                Haz clic en el siguiente botón para crear una nueva contraseña:
            </p>

            <div style="text-align:center; margin: 35px 0;">
                <a
                href="${resetUrl}"
                style="
                    background:#D4A373;
                    color:white;
                    text-decoration:none;
                    padding:14px 28px;
                    border-radius:50px;
                    display:inline-block;
                    font-weight:bold;
                "
                >
                Restablecer contraseña
                </a>
            </div>

            <p style="
                color:#777;
                font-size:14px;
                line-height:1.6;
                ">
                Este enlace expirará en <strong>1 hora</strong>.
            </p>

            <p style="
                color:#777;
                font-size:14px;
                line-height:1.6;
            ">
                Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
            </p>

            </div>

            <div style="
            background:#F5F5F4;
            padding:20px;
            text-align:center;
            font-size:12px;
            color:#999;
            ">
            © ${new Date().getFullYear()} My Space · Todos los derechos reservados
            </div>

        </div>

        </div>
        `;

  // Hacemos la petición HTTP a la API de Brevo
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        name: "My Space",
        email: senderEmail
      },
      to: [
        {
          email: email
        }
      ],
      subject: "Recuperación de contraseña",
      htmlContent: html
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al enviar correo mediante Brevo: ${response.status} - ${errorText}`);
  }

  console.log(`Correo enviado a ${email} mediante Brevo API`);
}

module.exports = {
  sendResetPasswordEmail
};
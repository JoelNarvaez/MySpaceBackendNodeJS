const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

async function sendResetPasswordEmail(email, resetUrl) {

  await transporter.sendMail({

    from: `"My Space" <${process.env.SENDER_EMAIL}>`,

    to: email,

    subject: "Recuperación de contraseña",

    html: `
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
        `
  });

  console.log(`Correo enviado a ${email}`);
}

module.exports = {
  sendResetPasswordEmail
};
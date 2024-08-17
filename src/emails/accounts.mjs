import sgMail from '@sendgrid/mail';


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        from:"noblenwala.nn@gmail.com",
        to: email,
        subject:"Thanks for Signing in",
        text:`Dear ${name}, welcome to my app. Be sure to reply for any assistance`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send ({
        from:"noblenwala.nn@gmail.com",
        to:email,
        subject:"Account cancellation",
        text: `Goodbye ${name}, we are sad to see you go. Is there anything we could have done to make your experience better?`
    })
}

export {sendWelcomeEmail,sendGoodbyeEmail}
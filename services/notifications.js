const nodeoutlook = require("nodejs-nodemailer-outlook");

async function sendNotification(params) {
  const { subject, html, text } = params;
  const payload = {
    auth: {
      user: "oaasgaa01@outlook.com",
      pass: "L*sgcLHB8-Rp4DMiWp8jbRRrm",
    },
    from: "oaasgaa01@outlook.com",
    to: " s7sniu65w1@pomail.net",
    subject,
    html,
    text,
    onError: (e) => console.log(e),
    onSuccess: (i) => console.log(i),
  };
  nodeoutlook.sendEmail(payload);
}

exports.sendNotification = sendNotification;

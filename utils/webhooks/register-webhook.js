const { CLOUDFLARE_WEBHOOK_URL, CLOUDFLARE_ACCOUNT_TOKEN, SERVER_ORIGINAL_URL } = process.env
const TEST_WEBHOOK_URL = `https://247b-197-211-59-109.ngrok-free.app`
const RegisterStreamWebhook = async () => {
      try {
            const data = {
                  notificationUrl: `${TEST_WEBHOOK_URL}/api/webhooks/cloudflare/processed-post-media`,
            }
            const res = await fetch(CLOUDFLARE_WEBHOOK_URL, {
                  method: "PUT",
                  body: JSON.stringify(data),
                  headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${CLOUDFLARE_ACCOUNT_TOKEN}`
                  },
            })

            if (!res.ok) {
                  console.error("Failed to register webhook", res)
            }

            console.log("Webhook registered successfully")
            const webhook = await res.json()
            console.log(webhook)
      } catch (error) {
            console.error("Failed to register webhook", error)
      }
}

module.exports = { RegisterStreamWebhook }

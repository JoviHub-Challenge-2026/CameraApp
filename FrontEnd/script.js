const img_input = document.getElementById("img_input")
const preview = document.getElementById("img_preview")
const user_msg = document.getElementById("user_msg")
const request = document.getElementById("request_send")
const ai_display = document.getElementById("ai-response")


function renderNode(node) {
    const div = document.createElement("div");
    const childrenContainer = document.createElement("div");
    childrenContainer.style.display = "none";
    div.innerText = node.name;
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            childrenContainer.appendChild(renderNode(child));
        });
        div.appendChild(childrenContainer);
        div.addEventListener("click", () => {
            if (childrenContainer.style.display === "none") {
                childrenContainer.style.display = "block";
            } else {
                childrenContainer.style.display = "none";
            }
        })
    }
    return div;
}

img_input.addEventListener("change", () => {
    let img = img_input.files[0]
    preview.src = URL.createObjectURL(img)
    img_input.style.display = "none"
    preview.style.background = "#000"
    document.querySelector(".image-section").classList.add("glow-active")
});

request.addEventListener("click", async() => {
    let file = img_input.files[0]
    if (!file) {
        alert("Please select an image first");
        return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async() => {
        const base64 = reader.result.split(",")[1];
        const response = await fetch("http://127.0.0.1:8000/chat", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                'message': user_msg.value,
                'image_base64': base64,
                'mime_type': 'image/jpeg'
            })
        })
        const data = await response.json();
        ai_display.innerText = JSON.stringify(data.reply, null, 2);

        data.reply.intents.forEach(async intent => {
            if (intent.intent_name === "image_gen") {
                const imgResponse = await fetch("http://127.0.0.1:8000/image_gen", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        'prompt': intent.prompt,
                        'image_base64': base64,
                    })
                })
                const image_data = await imgResponse.json()
                preview.src = "data:image/png;base64," + image_data.image;
            }
            if (intent.intent_name === "mindmap") {
                ai_display.innerHTML = "";
                ai_display.appendChild(renderNode(intent));
            }
        });
    };
})

/* Chat Input Div */
const textarea = document.getElementById("user_msg");

textarea.addEventListener("input", () =>{
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
})

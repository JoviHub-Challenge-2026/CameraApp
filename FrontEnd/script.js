const img_input = document.getElementById("img_input")
const preview = document.getElementById("img_preview")
const user_msg = document.getElementById("user_msg")
const request = document.getElementById("request_send")
const ai_display = document.getElementById("ai-response")

img_input.addEventListener("change", () => {
    let img = img_input.files[0]
    preview.src = URL.createObjectURL(img)
});

request.addEventListener("click", async() => {
    let file = img_input.files[0]
    if (!file) {
    alert("Please select an image first");
    return;
}
    //Converting img to base64
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
        console.log("Sending request to backend...");
        const data = await response.json();
        ai_display.innerText = data.reply;
        //ai_display.innerText = JSON.stringify(data.reply, null, 2); //see the response for debug
        console.log("Response:", data);


};
})
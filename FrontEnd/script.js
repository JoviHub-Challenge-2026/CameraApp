const img_input = document.getElementById("img_input")
const preview = document.getElementById("img_preview")
const user_msg = document.getElementById("user_msg")
const request = document.getElementById("request_send")

img_input.addEventListener("change", () => {
    let img = img_input.files[0]
    preview.src = URL.createObjectURL(img)
});

request.addEventListener("click", () => {
    let file = img_input.files[0]
    //Converting img to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
    
};
})
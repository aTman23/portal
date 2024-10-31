
const storedData = JSON.parse(localStorage.getItem("doc-data"));


if(!storedData?.userID){
window.location.href = "login.html";
localStorage.clear()
}

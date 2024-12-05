const storedData = JSON.parse(localStorage.getItem("doc-data"));

if (!storedData?.profile?.UserID) {
  console.log("No user ID found, redirecting to login...");

  setTimeout(() => {
    const storedData = JSON.parse(localStorage.getItem("doc-data"));


    if (!storedData?.profile?.UserID) {

    localStorage.clear();
    window.location.href = "login.html";
    }
  }, 2000); 
} else {
  console.log("User ID found, proceeding...");
  
}

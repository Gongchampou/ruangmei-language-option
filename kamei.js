document.addEventListener("DOMContentLoaded", function() {
    const a = document.getElementById("book-03");
    a.className = "card";
    a.target = "_blank";
    a.href = "#book-03";
    a.dataset.keywords = "book 03 book-03";
    a.innerHTML = '<img class="cover" src="https://placehold.co/300x450?text=Book+03" alt="Book 03 cover" /><div class="meta"><span class="id-badge">#book-03</span><h3 class="title">Book 03</h3></div>';
});


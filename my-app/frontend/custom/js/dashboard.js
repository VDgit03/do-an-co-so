function toggleWalletMenu(){

    const menu =
        document.getElementById("walletMenu");

    const arrow =
        document.querySelector(".arrow");

    menu.classList.toggle("show");

    arrow.classList.toggle("rotate");
}
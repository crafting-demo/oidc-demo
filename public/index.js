'use strict';

(() => {
    const main = async () => {
        const page = document.getElementById('page');
        try {
            const providers = await (await fetch('/auth/providers')).json();
            if (providers.length > 0) {
                const ul = document.createElement("ul");                
                for (let name of providers) {
                    const li = document.createElement("li");
                    li.innerHTML = `<a href="/login/${name}">${name}</a>`;
                    ul.appendChild(li);
                }
                page.appendChild(ul);
            } else {
                throw new Error('No auth providers');
            }
        } catch (e) {
            page.innerHTML = `<span>Error: ${e.message}</span>`;
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        main();
    });  
})();

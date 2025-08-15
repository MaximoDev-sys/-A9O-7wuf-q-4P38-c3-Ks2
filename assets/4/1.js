document.addEventListener('DOMContentLoaded', () => {
    // Lista de perfiles (puedes modificar las IDs y los identificadores HTML a gusto)
    const profiles = [
        { id: "837149144476155905", imgId: "img1", usernameId: "username1", decorId: "deco_us1", nameId: "name1" },
    ];

    profiles.forEach(profile => {
        const apiUrl = `https://discord-lookup-api-alpha.vercel.app/v1/user/${profile.id}`;

        const profilePicture = document.getElementById(profile.imgId);
        const nameText = document.getElementById(profile.nameId);
        const usernameText = document.getElementById(profile.usernameId);
        const avatarFrame = document.getElementById(profile.decorId);

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`API Response for ID ${profile.id}:`, data);

                // Set avatar
                const avatarUrl = data.avatar ? `${data.avatar.link}?size=1024` : './assets/pfp/default.jpg';
                if (profilePicture) {
                    profilePicture.src = avatarUrl;
                }

                // Mostrar nombre de usuario + tag
                if (usernameText) {
                    const tag = data.discriminator && data.discriminator !== "0" ? `#${data.discriminator}` : "";
                    usernameText.textContent = `${data.username}${tag}`;
                }

                // Mostrar nombre de usuario + tag
                if (nameText) {
                    nameText.textContent = `${data.global_name}`;
                }
                // Set avatar frame if available
                if (data.avatar_decoration && data.avatar_decoration.asset) {
                    const asset = data.avatar_decoration.asset;
                    const frameUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=1024&passthrough=true`;
                    // console.log("Avatar Frame URL:", frameUrl); // Debug: log frame URL
                    avatarFrame.src = frameUrl;
                    avatarFrame.style.display = 'block'; // Show the avatar frame
                } else {
                    console.warn("No avatar frame asset found.");
                }
            })
            .catch(error => {
                console.error(`Error fetching user data for ID ${profile.id}:`, error);
            });
    });
});
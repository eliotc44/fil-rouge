function pad(nombre) {
    return String(nombre).padStart(2, "0");
}

export function formaterHeure(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/* 3725000 ms → "01:02:05" */
export function formaterCompteARebours(ms) {
    const secondes = Math.max(0, Math.floor(ms / 1000));
    return `${pad(Math.floor(secondes / 3600))}:${pad(Math.floor(secondes / 60) % 60)}:${pad(secondes % 60)}`;
}

/* 3725000 ms → "PT1H2M5S" (attribut datetime d’une durée) */
export function getDureeIso(ms) {
    const secondes = Math.max(0, Math.floor(ms / 1000));
    return `PT${Math.floor(secondes / 3600)}H${Math.floor(secondes / 60) % 60}M${secondes % 60}S`;
}

/* « à 21:48 », « demain à 17:02 » ou « le 5 nov. à 17:02 » */
export function formaterArrivee(date, maintenant = new Date()) {
    const heure = formaterHeure(date);
    const jours = Math.round(
        (new Date(date.getFullYear(), date.getMonth(), date.getDate()) -
         new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate())) / 86400000
    );
    if (jours === 0) return `à ${heure}`;
    if (jours === 1) return `demain à ${heure}`;
    return `le ${date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} à ${heure}`;
}

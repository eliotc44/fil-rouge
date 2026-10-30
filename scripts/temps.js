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

export function estMemeJour(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getEcartJours(date, maintenant) {
    return Math.round(
        (new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate()) -
         new Date(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000
    );
}

/* Séparateur de jour : « Aujourd’hui », « Hier » ou « 5 novembre » */
export function formaterJour(date, maintenant = new Date()) {
    const ecart = getEcartJours(date, maintenant);
    if (ecart === 0) return "Aujourd’hui";
    if (ecart === 1) return "Hier";
    const options = { day: "numeric", month: "long" };
    if (date.getFullYear() !== maintenant.getFullYear()) options.year = "numeric";
    return date.toLocaleDateString("fr-FR", options);
}

/* Liste des conversations : « 19:41 », « Hier », « Lun. » ou « 05/11 » */
export function formaterHeureConversation(date, maintenant = new Date()) {
    const ecart = getEcartJours(date, maintenant);
    if (ecart === 0) return formaterHeure(date);
    if (ecart === 1) return "Hier";
    if (ecart > 1 && ecart < 7) {
        const jour = date.toLocaleDateString("fr-FR", { weekday: "short" });
        return jour.charAt(0).toUpperCase() + jour.slice(1);
    }
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

/* 30 s, 2 min, 1h12 */
export function formaterDuree(ms) {
    const secondes = Math.max(0, Math.ceil(ms / 1000));
    if (secondes < 60) return `${secondes} s`;
    if (secondes < 3600) return `${Math.ceil(secondes / 60)} min`;
    return `${Math.floor(secondes / 3600)}h${pad(Math.floor(secondes / 60) % 60)}`;
}

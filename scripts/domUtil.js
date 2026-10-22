export const IMAGE_PAR_DEFAUT = "./images/variable.webp";

/*
 * nodeDescr : { tag, class, text, dataKey, attrs, children }
 *   dataKey : le texte vient de data[dataKey]
 *   attrs   : un nom fini par « Key » lit sa valeur dans data (hrefKey → href), sinon valeur fixe
 */
export function createNode(nodeDescr, data = {}) {
    const el = document.createElement(nodeDescr.tag);
    if (nodeDescr.class) el.className = nodeDescr.class;

    if (nodeDescr.dataKey && data[nodeDescr.dataKey] !== undefined) {
        el.textContent = data[nodeDescr.dataKey];
    } else if (nodeDescr.text) {
        el.textContent = nodeDescr.text;
    }

    for (let [key, val] of Object.entries(nodeDescr.attrs ?? {})) {
        if (!key.endsWith("Key")) {
            el.setAttribute(key, val);
        } else if (data[val]) {
            el.setAttribute(key.slice(0, -3), data[val]);
        }
    }

    for (let enfant of nodeDescr.children ?? []) {
        el.appendChild(createNode(enfant, data));
    }
    return el;
}

export function afficherLoader(conteneur) {
    conteneur.replaceChildren(createNode({ tag: "div", class: "loader" }));
}

export function afficherMessageErreur(conteneur, message) {
    conteneur.replaceChildren(createNode({ tag: "p", class: "field-error", text: message, attrs: { role: "alert" } }));
}

/* Un <li> dans la liste, pour garder une liste valide */
export function afficherMessageVide(liste, message) {
    liste.replaceChildren(createNode({
        tag: "li",
        children: [{ tag: "p", class: "field-hint", text: message }]
    }));
}

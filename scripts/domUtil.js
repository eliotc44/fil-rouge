export const IMAGE_PAR_DEFAUT = "./images/variable.webp";

/*
 * template : { tag, class, text, dataKey, attrs, vars, children }
 *   attrs : un nom fini par « Key » lit la valeur dans data (srcKey → src), sinon valeur fixe
 *   vars  : { "--courier-color": "couleur" } → propriété personnalisée lue dans data
 */
export function createNode(template, data = {}) {
    const node = document.createElement(template.tag);

    if (template.class) node.className = template.class;
    if (template.text) node.textContent = template.text;
    if (template.dataKey) node.textContent = data[template.dataKey] ?? "";

    for (let [nom, valeur] of Object.entries(template.attrs ?? {})) {
        if (!nom.endsWith("Key")) {
            node.setAttribute(nom, valeur);
            continue;
        }
        const attribut = nom.slice(0, -3);
        const donnee = data[valeur];
        if (attribut === "src") {
            node.setAttribute("src", donnee || IMAGE_PAR_DEFAUT);
        } else if (donnee !== undefined && donnee !== null) {
            node.setAttribute(attribut, donnee);
        }
    }

    for (let [variable, cle] of Object.entries(template.vars ?? {})) {
        if (data[cle]) node.style.setProperty(variable, data[cle]);
    }

    for (let enfant of template.children ?? []) {
        node.append(createNode(enfant, data));
    }

    return node;
}

export function afficherLoader(conteneur) {
    conteneur.replaceChildren(createNode({ tag: "div", class: "loader" }));
}

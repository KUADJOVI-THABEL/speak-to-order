export function ellipsisProductName(name, maxLength = 18) {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 3) + '...';
}
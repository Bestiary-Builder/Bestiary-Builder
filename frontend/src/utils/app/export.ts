export const downloadFile = (data: Array<any> | Object, fileName: string) => {
    const file = new File(
        [
            JSON.stringify(data, null, 2)
        ],
        `${fileName}.txt`,
        {
            type: "text/plain"
        }
    );

    const link = document.createElement("a");
    const url = URL.createObjectURL(file);

    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
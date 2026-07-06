import api from "../api/api";

export const downloadKazepiFile = async (
  id: number,
  type: "kazepi" | "queue" | "uzepi" | "passport" | "guarantee" | "insurance" | "bakatkazavtojuli" | "russia_queue" | "driver_document"
) => {
  try {
    const response = await api.get(
      `/admin/${type}-files/${id}/download`,
      {
        responseType: "blob",
      }
    );

    // 👉 MIME type ni backenddan olish
    const mimeType =
      response.headers["content-type"] || "application/octet-stream";

    const blob = new Blob([response.data], { type: mimeType });

    // filename
    const contentDisposition = response.headers["content-disposition"];
    let fileName = "file";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match?.[1]) fileName = match[1];
    }

    // extension fallback (agar backend bermasa)
    if (!fileName.includes(".")) {
      if (mimeType.includes("pdf")) fileName += ".pdf";
      else if (mimeType.includes("png")) fileName += ".png";
      else if (mimeType.includes("jpeg") || mimeType.includes("jpg"))
        fileName += ".jpg";
      else if (mimeType.includes("msword"))
        fileName += ".doc";
      else if (mimeType.includes("officedocument"))
        fileName += ".docx";
      else fileName += ".bin";
    }

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
  }
};


export const downloadImages = async (
  id: number,
  type: "kazepi" | "queue" | "uzepi" | "passport" | "guarantee" | "insurance" | "bakatkazavtojuli" | "russia_queue" | "driver_document"
) => {
  try {
    const response = await api.get(`/download/${type}/${id}`, {
      responseType: "blob",
    });

    const blob = response.data;

    const disposition = response.headers["content-disposition"];

    let fileName = "images.zip";

    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match) fileName = decodeURIComponent(match[1]);
    }

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();

    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
  }
};
import Editor from "../components/EditorWithAI";

export default async function HomePage() {
  return (
    <div>
      <title>Penina</title>
      <Editor />
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};

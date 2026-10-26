type IconName = "export" | "import" | "chevron";

type Props = {
  name: IconName;
  className?: string;
};

export function UiIcon({ name, className }: Props) {
  if (name === "chevron") {
    return <svg className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="#72464d" d="M10.02 6L8.61 7.41L13.19 12l-4.58 4.59L10.02 18l6-6z" /></svg>;
  }

  return name === "export" ? <svg className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path d="M0 0h1024v1024H0z" fill="none" /><path fill="#72464d" fillRule="evenodd" d="M880 912H144c-17.7 0-32-14.3-32-32V144c0-17.7 14.3-32 32-32h360c4.4 0 8 3.6 8 8v56c0 4.4-3.6 8-8 8H184v656h656V520c0-4.4 3.6-8 8-8h56c4.4 0 8 3.6 8 8v360c0 17.7-14.3 32-32 32M770.87 199.131l-52.2-52.2c-4.7-4.7-1.9-12.8 4.7-13.6l179.4-21c5.1-.6 9.5 3.7 8.9 8.9l-21 179.4c-.8 6.6-8.9 9.4-13.6 4.7l-52.4-52.4l-256.2 256.2c-3.1 3.1-8.2 3.1-11.3 0l-42.4-42.4c-3.1-3.1-3.1-8.2 0-11.3z" /></svg> : <svg className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path d="M0 0h1024v1024H0z" fill="none" /><path fill="#72464d" fillRule="evenodd" d="M880 912H144c-17.7 0-32-14.3-32-32V144c0-17.7 14.3-32 32-32h360c4.4 0 8 3.6 8 8v56c0 4.4-3.6 8-8 8H184v656h656V520c0-4.4 3.6-8 8-8h56c4.4 0 8 3.6 8 8v360c0 17.7-14.3 32-32 32M653.3 424.6l52.2 52.2c4.7 4.7 1.9 12.8-4.7 13.6l-179.4 21c-5.1.6-9.5-3.7-8.9-8.9l21-179.4c.8-6.6 8.9-9.4 13.6-4.7l52.4 52.4l256.2-256.2c3.1-3.1 8.2-3.1 11.3 0l42.4 42.4c3.1 3.1 3.1 8.2 0 11.3z" /></svg>;
}

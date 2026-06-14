const CONTACT_KEY = "aibc_contact_messages";

export type ContactTopic = "general" | "developers" | "advertisers" | "publishers" | "privacy";

export type ContactMessage = {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  sentAt: string;
};

export const CONTACT_TOPICS: { value: ContactTopic; label: string }[] = [
  { value: "general", label: "General inquiry" },
  { value: "developers", label: "Developer support" },
  { value: "advertisers", label: "Advertising & campaigns" },
  { value: "publishers", label: "Publisher partnerships" },
  { value: "privacy", label: "Privacy & legal" },
];

export const SUPPORT_EMAIL = "watchaibc@gmail.com";

export function submitContactMessage(data: Omit<ContactMessage, "sentAt">) {
  const messages: ContactMessage[] = JSON.parse(localStorage.getItem(CONTACT_KEY) || "[]");
  messages.push({ ...data, sentAt: new Date().toISOString() });
  localStorage.setItem(CONTACT_KEY, JSON.stringify(messages));
}

export function buildContactMailto(data: Omit<ContactMessage, "sentAt">) {
  const topicLabel = CONTACT_TOPICS.find((t) => t.value === data.topic)?.label ?? data.topic;
  const subject = encodeURIComponent(`AIBC Media — ${topicLabel}`);
  const body = encodeURIComponent(
    `Name: ${data.name}\nEmail: ${data.email}\nTopic: ${topicLabel}\n\n${data.message}`,
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

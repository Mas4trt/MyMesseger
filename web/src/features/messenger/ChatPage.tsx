import { useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import './chat.css';

type IconName = 'add' | 'bell' | 'gift' | 'hash' | 'help' | 'menu' | 'mic' | 'mute' | 'pin' | 'plus' | 'search' | 'settings' | 'smile' | 'users' | 'video';

const iconPaths: Record<IconName, string> = {
  add: 'M12 5v14M5 12h14', bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4', gift: 'M20 12v9H4v-9M2 7h20v5H2zM12 7v14M12 7H7.5a2.5 2.5 0 1 1 2.5-2.5C10 5.5 12 7 12 7Zm0 0h4.5A2.5 2.5 0 1 0 14 4.5C14 5.5 12 7 12 7Z', hash: 'M5 9h14M4 15h14M10 3 8 21M16 3l-2 18', help: 'M9.1 9a3 3 0 1 1 5.5 1.8c-1.4.9-2.6 1.6-2.6 3.7M12 18.5v.1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', menu: 'M4 6h16M4 12h16M4 18h16', mic: 'M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3ZM19 11a7 7 0 0 1-14 0M12 18v3M8 21h8', mute: 'm4 4 16 16M9 9.5V11a3 3 0 0 0 4.8 2.4M15 10.5V5a3 3 0 0 0-5.8-1M19 11a7 7 0 0 1-1.1 3.8M5 11a7 7 0 0 0 10.1 6.3M12 18v3M8 21h8', pin: 'm15 4 5 5-3 1-4 4 1 4-1 1-4-4-4 4-1-1 4-4-4-4 1-1 4 1 4-4zM5 19l-2 2', plus: 'M12 5v14M5 12h14', search: 'm21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z', settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.4 2.4-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.4-2.4.1-.1A1.7 1.7 0 0 0 6 15a1.7 1.7 0 0 0-1.5-1H4.3v-3.4h.2A1.7 1.7 0 0 0 6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1L8 4.6l.1.1A1.7 1.7 0 0 0 10 5a1.7 1.7 0 0 0 1-1.5v-.2h3.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z', smile: 'M8 14s1.5 2 4 2 4-2 4-2M8.5 9h.01M15.5 9h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8', video: 'm16 8 5-3v14l-5-3V8ZM3 6h13v12H3z',
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]} /></svg>;
}

const channels = ['общий', 'дизайн', 'разработка', 'random'];
const members = [
  { name: 'Алина', role: 'Администратор', avatar: 'А', color: '#f47b67', status: 'online' },
  { name: 'Марк', role: 'Разработчик', avatar: 'М', color: '#5865f2', status: 'online' },
  { name: 'София', role: 'Дизайнер', avatar: 'С', color: '#eb7dba', status: 'idle' },
  { name: 'Никита', role: 'Гость', avatar: 'Н', color: '#43b581', status: 'offline' },
];

type Message = { id: number; author: string; time: string; avatar: string; color: string; text: string; accent?: boolean };
const initialMessages: Message[] = [
  { id: 1, author: 'Алина', time: 'Сегодня, в 10:14', avatar: 'А', color: '#f47b67', text: 'Доброе утро, команда! Собрала свежие правки для главного экрана.' },
  { id: 2, author: 'Марк', time: 'Сегодня, в 10:18', avatar: 'М', color: '#5865f2', text: 'Выглядит отлично. Я завершу адаптивную вёрстку и отправлю на ревью к обеду.' },
  { id: 3, author: 'София', time: 'Сегодня, в 10:21', avatar: 'С', color: '#eb7dba', text: 'Добавила комментарии в макет и подготовила состояния для пустых списков.', accent: true },
];

export default function ChatPage() {
  const { logout } = useAuth();
  const [activeChannel, setActiveChannel] = useState('общий');
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [showMembers, setShowMembers] = useState(true);
  const [showChannels, setShowChannels] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const onlineCount = useMemo(() => members.filter(({ status }) => status !== 'offline').length, []);

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: Date.now(), author: 'Вы', time: 'Сейчас', avatar: 'В', color: '#23a55a', text }]);
    setDraft('');
  }

  return <main className="messenger-shell">
    <nav className="server-rail" aria-label="Серверы">
      <button className="server-logo" aria-label="Главная"><span>m</span></button>
      <span className="rail-divider" />
      <button className="server-icon is-active" aria-label="Сервер команды">M</button>
      <button className="server-icon server-icon--violet" aria-label="Дизайн">✦</button>
      <button className="server-icon server-icon--green" aria-label="Разработка">&lt;/&gt;</button>
      <button className="server-icon server-icon--add" aria-label="Добавить сервер"><Icon name="plus" /></button>
    </nav>

    <aside className={`channel-panel ${showChannels ? 'is-open' : ''}`}>
      <header className="server-header"><span>MyMessenger</span><button aria-label="Меню сервера"><Icon name="menu" size={18} /></button></header>
      <div className="channel-scroll">
        <div className="channel-category"><span>ТЕКСТОВЫЕ КАНАЛЫ</span><button aria-label="Добавить канал"><Icon name="add" size={15} /></button></div>
        {channels.map((channel) => <button key={channel} className={`channel-button ${channel === activeChannel ? 'is-active' : ''}`} onClick={() => { setActiveChannel(channel); setShowChannels(false); }}><Icon name="hash" size={18} /><span>{channel}</span>{channel === 'общий' && <span className="unread-dot" />}</button>)}
        <div className="channel-category"><span>ГОЛОСОВЫЕ КАНАЛЫ</span><button aria-label="Добавить канал"><Icon name="add" size={15} /></button></div>
        <button className="channel-button"><Icon name="video" size={17} /><span>Комната отдыха</span></button>
      </div>
      <footer className="user-bar">
        <div className="avatar avatar--you">В<span className="status-dot online" /></div><div className="user-meta"><strong>Вы</strong><span>В сети</span></div>
        <div className="user-actions"><button onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}><Icon name={isMuted ? 'mute' : 'mic'} size={18} /></button><button onClick={logout} aria-label="Настройки и выход"><Icon name="settings" size={18} /></button></div>
      </footer>
    </aside>

    <section className="conversation">
      <header className="conversation-header"><button className="mobile-menu" onClick={() => setShowChannels(true)} aria-label="Открыть каналы"><Icon name="menu" /></button><Icon name="hash" size={23} /><h1>{activeChannel}</h1><span className="topic">Общаемся, делимся идеями и новостями</span><div className="header-actions"><button aria-label="Уведомления"><Icon name="bell" /></button><button aria-label="Закреплённые сообщения"><Icon name="pin" /></button><button className="members-button" onClick={() => setShowMembers(!showMembers)} aria-label="Участники"><Icon name="users" /></button><label className="search-field"><input aria-label="Поиск" placeholder="Поиск" /><Icon name="search" size={16} /></label><button aria-label="Помощь"><Icon name="help" /></button></div></header>
      <div className="message-list" aria-live="polite">
        <div className="channel-intro"><div className="intro-hash"><Icon name="hash" size={42} /></div><h2>Добро пожаловать в канал #{activeChannel}!</h2><p>Это начало канала #{activeChannel}.</p></div>
        <div className="date-divider"><span>Сегодня</span></div>
        {messages.map((message) => <article className="message" key={message.id}><div className="avatar" style={{ background: message.color }}>{message.avatar}</div><div className="message-body"><div className="message-info"><strong>{message.author}</strong>{message.accent && <span className="role-badge">Дизайнер</span>}<time>{message.time}</time></div><p>{message.text}</p></div></article>)}
      </div>
      <form className="composer" onSubmit={sendMessage}><button type="button" className="add-attachment" aria-label="Прикрепить файл"><Icon name="add" size={20} /></button><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Написать #${activeChannel}`} aria-label={`Сообщение в канал ${activeChannel}`} /><div className="composer-actions"><button type="button" aria-label="Подарок"><Icon name="gift" /></button><button type="button" aria-label="Эмодзи"><Icon name="smile" /></button></div></form>
    </section>

    <aside className={`member-panel ${showMembers ? 'is-visible' : ''}`}><div className="member-group-title">В СЕТИ — {onlineCount}</div>{members.filter(({ status }) => status !== 'offline').map((member) => <button className="member" key={member.name}><div className="avatar" style={{ background: member.color }}>{member.avatar}<span className={`status-dot ${member.status}`} /></div><div><strong>{member.name}</strong><span>{member.role}</span></div></button>)}<div className="member-group-title offline-title">НЕ В СЕТИ — 1</div>{members.filter(({ status }) => status === 'offline').map((member) => <button className="member is-offline" key={member.name}><div className="avatar" style={{ background: member.color }}>{member.avatar}<span className="status-dot offline" /></div><div><strong>{member.name}</strong><span>{member.role}</span></div></button>)}</aside>
  </main>;
}

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Client, type IFrame, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../AuthContext';
import { useParams } from 'react-router-dom';
import styles from './StompComponent.module.css';
import ip from '../../../default.ts';
import api from '../../api/axios';

interface MessagesType {
	sender: string; // 보내는 주체
	content: string; // 보내는 메시지
}

interface StompComponentProps {
	opponentId?: string;
}

const StompComponent: React.FC<StompComponentProps> = ({ opponentId: propOpponentId }) => {
	const { loginId } = useAuth();
	const { opponentId: paramOpponentId } = useParams<{ opponentId: string }>();
	const opponentId = propOpponentId || paramOpponentId;
	const scrollRef = useRef<HTMLDivElement>(null);
	const [opponentNickname, setOpponentNickname] = useState<string>(opponentId || '');

	useEffect(() => {
		if (opponentId) {
			api.get(`/api/public/nickname?loginId=${opponentId}`)
				.then((res) => {
					if (res.data) {
						setOpponentNickname(res.data);
					}
				})
				.catch((err) => {
					console.error("상대방 닉네임을 가져오는데 실패했습니다.", err);
				});
		}
	}, [opponentId]);

	const SERVER_URL =  `http://${ip}:8080/ws-stomp`;
	
	const roomId = useMemo(() => {
		if (!loginId || !opponentId) return '';
		return [loginId, opponentId].sort().join('_');
	}, [loginId, opponentId]);

	const PUB_ENDPOINT = `/pub/chat/${roomId}`;
	const SUB_ENDPOINT = `/sub/chat/${roomId}`;


	const [wsClient, setWsClient] = useState<Client>();
	const [isEnterChat, setIsEnterChat] = useState<boolean>(false);
	const [messages, setMessages] = useState<MessagesType[]>([]);
	const [messageObj, setMessageObj] = useState<MessagesType>({
		content: '',
		sender: loginId || 'anonymous',
	});

	// 스크롤 하단 이동
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]); // 메시지가 업데이트 될 때마다 스크롤을 하단으로 이동

	const stompHandler = (() => {
		return {
			connect: () => {
				if (!roomId) {
					console.error("Room ID is not defined.");
					return;
				}
				const client = new Client({
					webSocketFactory: () => new SockJS(SERVER_URL),
					reconnectDelay: 5000,
					heartbeatIncoming: 4000,
					heartbeatOutgoing: 4000,

					onConnect: (conn: IFrame) => {
						console.log('[+] WebSocket 연결이 되었습니다.', conn);
						setIsEnterChat(true);
						client.subscribe(SUB_ENDPOINT, (message: IMessage) => {
							try {
								const receiveData = JSON.parse(message.body);
								setMessages((prev) => [...prev, {
									content: receiveData.content,
									sender: receiveData.sender,
								}]);
							} catch (error) {
								console.warn("수신된 메시지가 JSON 형식이 아닙니다:", message.body);
								setMessages((prev) => [...prev, {
									content: message.body,
									sender: 'system', 
								}]);
							}
						});
					},
					onWebSocketClose: (close) => {
						console.log('[-] WebSocket 연결이 종료 되었습니다.', close);
					},
					onWebSocketError: (error) => {
						console.error('[-] 웹 소켓 연결 오류가 발생하였습니다.', error);
					},
					onStompError: (frame) => {
						console.error('Broker reported error: ' + frame.headers['message']);
						console.error('Additional details: ' + frame.body);
					},
				});
				setWsClient(client);
				client.activate();
			},
			sendMessage: () => {
				if (wsClient && wsClient.connected && messageObj.content.trim() !== '' && loginId) {
					wsClient.publish({
						destination: PUB_ENDPOINT,
						body: JSON.stringify({ ...messageObj, sender: loginId, roomId: roomId }),
					});
					setMessageObj({ content: '', sender: loginId });
					
				}
			},
			disconnect: () => {
				console.log('[-] 웹 소켓 연결을 종료합니다.');
				if (wsClient) {
					wsClient.deactivate();
					setWsClient(undefined);
					setIsEnterChat(false);
				}
			},
		};
	})();

	useEffect(() => {
		return () => {
			if (wsClient) {
				wsClient.deactivate();
			}
		};
	}, [wsClient]);



	return (
		<div className={styles.stompContainer}>
			<div className={styles.chatContainer}>
				{!isEnterChat ? (
					<div className={styles.emptyState}>
						<div className={styles.pikachuIconLarge}></div>
						<h2>{opponentNickname}님과<br />대화를 시작하시겠습니까?</h2>
						<button className={styles.startChatButton} onClick={stompHandler.connect}>
							대화 시작하기
						</button>
					</div>
				) : (
					<div className={styles.chatWrapper}>
						<div className={styles.chatHeader}>
							<div style={{ display: 'flex', alignItems: 'center' }}>
								<div className={styles.pikachuIcon}></div>
								<span>{opponentNickname}님과 채팅 중</span>
							</div>
							<button className={styles.disconnectButton} onClick={stompHandler.disconnect}>
								종료
							</button>
						</div>

						<div className={styles.messageList} ref={scrollRef}>
							{messages.map((item, index) => {
								const isMine = item.sender === loginId;
								return (
									<div
										key={`messages-${index}`}
										className={`${styles.messageItem} ${isMine ? styles.myMessage : styles.otherMessage}`}
									>
										{!isMine && <div className={styles.senderName}>{item.sender === opponentId ? opponentNickname : item.sender}</div>}
										<div className={`${styles.bubble} ${isMine ? styles.myBubble : styles.otherBubble}`}>
											{item.content}
										</div>
									</div>
								);
							})}
						</div>

						<div className={styles.inputSection}>
							<input
								className={styles.chatInput}
								type='text'
								autoFocus
								placeholder="메시지를 입력하세요..."
								value={messageObj.content}
								onChange={(e) => setMessageObj({ ...messageObj, content: e.target.value })}
								onKeyPress={(e) => {
									if (e.key === 'Enter') stompHandler.sendMessage();
								}}
							/>
							<button 
								className={styles.sendButton} 
								onClick={stompHandler.sendMessage}
								disabled={!messageObj.content.trim()}
							>
								전송
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default StompComponent;

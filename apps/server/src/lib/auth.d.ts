export declare function createAuth(env: any): {
	handler: (request: Request) => Promise<Response>;
	api: import("better-auth").InferAPI<
		{
			ok: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0?:
						| ({
								body?: undefined;
						  } & {
								method?: "GET" | undefined;
						  } & {
								query?: Record<string, any> | undefined;
						  } & {
								params?: Record<string, any>;
						  } & {
								request?: Request;
						  } & {
								headers?: HeadersInit;
						  } & {
								asResponse?: boolean;
								returnHeaders?: boolean;
								use?: import("better-auth").Middleware[];
								path?: string;
						  } & {
								asResponse?: AsResponse | undefined;
								returnHeaders?: ReturnHeaders | undefined;
						  })
						| undefined,
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										ok: boolean;
									};
								}
							: {
									ok: boolean;
								}
				>;
				options: {
					method: "GET";
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													ok: {
														type: string;
														description: string;
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
						isAction: false;
					};
				} & {
					use: any[];
				};
				path: "/ok";
			};
			error: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0?:
						| ({
								body?: undefined;
						  } & {
								method?: "GET" | undefined;
						  } & {
								query?: Record<string, any> | undefined;
						  } & {
								params?: Record<string, any>;
						  } & {
								request?: Request;
						  } & {
								headers?: HeadersInit;
						  } & {
								asResponse?: boolean;
								returnHeaders?: boolean;
								use?: import("better-auth").Middleware[];
								path?: string;
						  } & {
								asResponse?: AsResponse | undefined;
								returnHeaders?: ReturnHeaders | undefined;
						  })
						| undefined,
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: Response;
								}
							: Response
				>;
				options: {
					method: "GET";
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"text/html": {
											schema: {
												type: "string";
												description: string;
											};
										};
									};
								};
							};
						};
						isAction: false;
					};
				} & {
					use: any[];
				};
				path: "/error";
			};
			signInSocial: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							provider: unknown;
							callbackURL?: string | undefined;
							newUserCallbackURL?: string | undefined;
							errorCallbackURL?: string | undefined;
							disableRedirect?: boolean | undefined;
							idToken?:
								| {
										token: string;
										nonce?: string | undefined;
										accessToken?: string | undefined;
										refreshToken?: string | undefined;
										expiresAt?: number | undefined;
								  }
								| undefined;
							scopes?: string[] | undefined;
							requestSignUp?: boolean | undefined;
							loginHint?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response:
										| {
												redirect: boolean;
												token: string;
												url: undefined;
												user: {
													id: string;
													email: string;
													name: string;
													image: string | null | undefined;
													emailVerified: boolean;
													createdAt: Date;
													updatedAt: Date;
												};
										  }
										| {
												url: string;
												redirect: boolean;
										  };
								}
							:
									| {
											redirect: boolean;
											token: string;
											url: undefined;
											user: {
												id: string;
												email: string;
												name: string;
												image: string | null | undefined;
												emailVerified: boolean;
												createdAt: Date;
												updatedAt: Date;
											};
									  }
									| {
											url: string;
											redirect: boolean;
									  }
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							callbackURL: import("zod").ZodOptional<import("zod").ZodString>;
							newUserCallbackURL: import("zod").ZodOptional<import("zod").ZodString>;
							errorCallbackURL: import("zod").ZodOptional<import("zod").ZodString>;
							provider: import("zod").ZodType<
								| "apple"
								| (string & {})
								| "discord"
								| "facebook"
								| "github"
								| "microsoft"
								| "google"
								| "huggingface"
								| "slack"
								| "spotify"
								| "twitch"
								| "twitter"
								| "dropbox"
								| "kick"
								| "linear"
								| "linkedin"
								| "gitlab"
								| "tiktok"
								| "reddit"
								| "roblox"
								| "vk"
								| "zoom"
								| "notion",
								unknown,
								import("zod/v4/core").$ZodTypeInternals<
									| "apple"
									| (string & {})
									| "discord"
									| "facebook"
									| "github"
									| "microsoft"
									| "google"
									| "huggingface"
									| "slack"
									| "spotify"
									| "twitch"
									| "twitter"
									| "dropbox"
									| "kick"
									| "linear"
									| "linkedin"
									| "gitlab"
									| "tiktok"
									| "reddit"
									| "roblox"
									| "vk"
									| "zoom"
									| "notion",
									unknown
								>
							>;
							disableRedirect: import("zod").ZodOptional<import("zod").ZodBoolean>;
							idToken: import("zod").ZodOptional<
								import("zod").ZodObject<
									{
										token: import("zod").ZodString;
										nonce: import("zod").ZodOptional<import("zod").ZodString>;
										accessToken: import("zod").ZodOptional<import("zod").ZodString>;
										refreshToken: import("zod").ZodOptional<import("zod").ZodString>;
										expiresAt: import("zod").ZodOptional<import("zod").ZodNumber>;
									},
									import("zod/v4/core").$strip
								>
							>;
							scopes: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
							requestSignUp: import("zod").ZodOptional<import("zod").ZodBoolean>;
							loginHint: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					metadata: {
						openapi: {
							description: string;
							operationId: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												description: string;
												properties: {
													redirect: {
														type: string;
														enum: boolean[];
													};
													token: {
														type: string;
														description: string;
														url: {
															type: string;
															nullable: boolean;
														};
														user: {
															type: string;
															properties: {
																id: {
																	type: string;
																};
																email: {
																	type: string;
																};
																name: {
																	type: string;
																	nullable: boolean;
																};
																image: {
																	type: string;
																	nullable: boolean;
																};
																emailVerified: {
																	type: string;
																};
																createdAt: {
																	type: string;
																	format: string;
																};
																updatedAt: {
																	type: string;
																	format: string;
																};
															};
															required: string[];
														};
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/sign-in/social";
			};
			callbackOAuth: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?:
							| {
									code?: string | undefined;
									error?: string | undefined;
									device_id?: string | undefined;
									error_description?: string | undefined;
									state?: string | undefined;
									user?: string | undefined;
							  }
							| undefined;
					} & {
						method: "GET" | "POST";
					} & {
						query?:
							| {
									code?: string | undefined;
									error?: string | undefined;
									device_id?: string | undefined;
									error_description?: string | undefined;
									state?: string | undefined;
									user?: string | undefined;
							  }
							| undefined;
					} & {
						params: {
							id: string;
						};
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: undefined;
								}
							: void
				>;
				options: {
					method: ("GET" | "POST")[];
					body: import("zod").ZodOptional<
						import("zod").ZodObject<
							{
								code: import("zod").ZodOptional<import("zod").ZodString>;
								error: import("zod").ZodOptional<import("zod").ZodString>;
								device_id: import("zod").ZodOptional<import("zod").ZodString>;
								error_description: import("zod").ZodOptional<import("zod").ZodString>;
								state: import("zod").ZodOptional<import("zod").ZodString>;
								user: import("zod").ZodOptional<import("zod").ZodString>;
							},
							import("zod/v4/core").$strip
						>
					>;
					query: import("zod").ZodOptional<
						import("zod").ZodObject<
							{
								code: import("zod").ZodOptional<import("zod").ZodString>;
								error: import("zod").ZodOptional<import("zod").ZodString>;
								device_id: import("zod").ZodOptional<import("zod").ZodString>;
								error_description: import("zod").ZodOptional<import("zod").ZodString>;
								state: import("zod").ZodOptional<import("zod").ZodString>;
								user: import("zod").ZodOptional<import("zod").ZodString>;
							},
							import("zod/v4/core").$strip
						>
					>;
					metadata: {
						isAction: false;
					};
				} & {
					use: any[];
				};
				path: "/callback/:id";
			};
			getSession: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?: undefined;
					} & {
						method?: "GET" | undefined;
					} & {
						query?:
							| {
									disableCookieCache?: unknown;
									disableRefresh?: unknown;
							  }
							| undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										session: {
											id: string;
											userId: string;
											expiresAt: Date;
											createdAt: Date;
											updatedAt: Date;
											token: string;
											ipAddress?: string | null | undefined | undefined;
											userAgent?: string | null | undefined | undefined;
										};
										user: {
											id: string;
											email: string;
											emailVerified: boolean;
											name: string;
											createdAt: Date;
											updatedAt: Date;
											image?: string | null | undefined | undefined;
											role: string | null | undefined;
										};
									} | null;
								}
							: {
									session: {
										id: string;
										userId: string;
										expiresAt: Date;
										createdAt: Date;
										updatedAt: Date;
										token: string;
										ipAddress?: string | null | undefined | undefined;
										userAgent?: string | null | undefined | undefined;
									};
									user: {
										id: string;
										email: string;
										emailVerified: boolean;
										name: string;
										createdAt: Date;
										updatedAt: Date;
										image?: string | null | undefined | undefined;
										role: string | null | undefined;
									};
								} | null
				>;
				options: {
					method: "GET";
					query: import("zod").ZodOptional<
						import("zod").ZodObject<
							{
								disableCookieCache: import("zod").ZodOptional<
									import("zod").ZodCoercedBoolean<unknown>
								>;
								disableRefresh: import("zod").ZodOptional<import("zod").ZodCoercedBoolean<unknown>>;
							},
							import("zod/v4/core").$strip
						>
					>;
					requireHeaders: true;
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													session: {
														$ref: string;
													};
													user: {
														$ref: string;
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/get-session";
			};
			signOut: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?: undefined;
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										success: boolean;
									};
								}
							: {
									success: boolean;
								}
				>;
				options: {
					method: "POST";
					requireHeaders: true;
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													success: {
														type: string;
													};
												};
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/sign-out";
			};
			signUpEmail: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							name: string;
							email: string;
							password: string;
							image?: string;
							callbackURL?: string;
							rememberMe?: boolean;
						} & {} & {};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response:
										| {
												token: null;
												user: {
													id: string;
													email: string;
													name: string;
													image: string | null | undefined;
													emailVerified: boolean;
													createdAt: Date;
													updatedAt: Date;
												};
										  }
										| {
												token: string;
												user: {
													id: string;
													email: string;
													name: string;
													image: string | null | undefined;
													emailVerified: boolean;
													createdAt: Date;
													updatedAt: Date;
												};
										  };
								}
							:
									| {
											token: null;
											user: {
												id: string;
												email: string;
												name: string;
												image: string | null | undefined;
												emailVerified: boolean;
												createdAt: Date;
												updatedAt: Date;
											};
									  }
									| {
											token: string;
											user: {
												id: string;
												email: string;
												name: string;
												image: string | null | undefined;
												emailVerified: boolean;
												createdAt: Date;
												updatedAt: Date;
											};
									  }
				>;
				options: {
					method: "POST";
					body: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodAny>;
					metadata: {
						$Infer: {
							body: {
								name: string;
								email: string;
								password: string;
								image?: string;
								callbackURL?: string;
								rememberMe?: boolean;
							} & {} & {};
						};
						openapi: {
							description: string;
							requestBody: {
								content: {
									"application/json": {
										schema: {
											type: "object";
											properties: {
												name: {
													type: string;
													description: string;
												};
												email: {
													type: string;
													description: string;
												};
												password: {
													type: string;
													description: string;
												};
												image: {
													type: string;
													description: string;
												};
												callbackURL: {
													type: string;
													description: string;
												};
												rememberMe: {
													type: string;
													description: string;
												};
											};
											required: string[];
										};
									};
								};
							};
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													token: {
														type: string;
														nullable: boolean;
														description: string;
													};
													user: {
														type: string;
														properties: {
															id: {
																type: string;
																description: string;
															};
															email: {
																type: string;
																format: string;
																description: string;
															};
															name: {
																type: string;
																description: string;
															};
															image: {
																type: string;
																format: string;
																nullable: boolean;
																description: string;
															};
															emailVerified: {
																type: string;
																description: string;
															};
															createdAt: {
																type: string;
																format: string;
																description: string;
															};
															updatedAt: {
																type: string;
																format: string;
																description: string;
															};
														};
														required: string[];
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/sign-up/email";
			};
			signInEmail: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							email: string;
							password: string;
							callbackURL?: string | undefined;
							rememberMe?: boolean | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										redirect: boolean;
										token: string;
										url: string | undefined;
										user: {
											id: string;
											email: string;
											name: string;
											image: string | null | undefined;
											emailVerified: boolean;
											createdAt: Date;
											updatedAt: Date;
										};
									};
								}
							: {
									redirect: boolean;
									token: string;
									url: string | undefined;
									user: {
										id: string;
										email: string;
										name: string;
										image: string | null | undefined;
										emailVerified: boolean;
										createdAt: Date;
										updatedAt: Date;
									};
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							email: import("zod").ZodString;
							password: import("zod").ZodString;
							callbackURL: import("zod").ZodOptional<import("zod").ZodString>;
							rememberMe: import("zod").ZodOptional<
								import("zod").ZodDefault<import("zod").ZodBoolean>
							>;
						},
						import("zod/v4/core").$strip
					>;
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												description: string;
												properties: {
													redirect: {
														type: string;
														enum: boolean[];
													};
													token: {
														type: string;
														description: string;
													};
													url: {
														type: string;
														nullable: boolean;
													};
													user: {
														type: string;
														properties: {
															id: {
																type: string;
															};
															email: {
																type: string;
															};
															name: {
																type: string;
																nullable: boolean;
															};
															image: {
																type: string;
																nullable: boolean;
															};
															emailVerified: {
																type: string;
															};
															createdAt: {
																type: string;
																format: string;
															};
															updatedAt: {
																type: string;
																format: string;
															};
														};
														required: string[];
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/sign-in/email";
			};
			forgetPassword: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							email: string;
							redirectTo?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							email: import("zod").ZodString;
							redirectTo: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													status: {
														type: string;
													};
													message: {
														type: string;
													};
												};
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/forget-password";
			};
			resetPassword: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							newPassword: string;
							token?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?:
							| {
									token?: string | undefined;
							  }
							| undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					query: import("zod").ZodOptional<
						import("zod").ZodObject<
							{
								token: import("zod").ZodOptional<import("zod").ZodString>;
							},
							import("zod/v4/core").$strip
						>
					>;
					body: import("zod").ZodObject<
						{
							newPassword: import("zod").ZodString;
							token: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													status: {
														type: string;
													};
												};
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/reset-password";
			};
			verifyEmail: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?: undefined;
					} & {
						method?: "GET" | undefined;
					} & {
						query: {
							token: string;
							callbackURL?: string | undefined;
						};
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response:
										| undefined
										| {
												status: boolean;
												user: {
													id: any;
													email: any;
													name: any;
													image: any;
													emailVerified: any;
													createdAt: any;
													updatedAt: any;
												};
										  }
										| {
												status: boolean;
												user: null;
										  };
								}
							:
									| undefined
									| {
											status: boolean;
											user: {
												id: any;
												email: any;
												name: any;
												image: any;
												emailVerified: any;
												createdAt: any;
												updatedAt: any;
											};
									  }
									| {
											status: boolean;
											user: null;
									  }
				>;
				options: {
					method: "GET";
					query: import("zod").ZodObject<
						{
							token: import("zod").ZodString;
							callbackURL: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<void>)[];
					metadata: {
						openapi: {
							description: string;
							parameters: (
								| {
										name: string;
										in: "query";
										description: string;
										required: true;
										schema: {
											type: "string";
										};
								  }
								| {
										name: string;
										in: "query";
										description: string;
										required: false;
										schema: {
											type: "string";
										};
								  }
							)[];
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													user: {
														type: string;
														properties: {
															id: {
																type: string;
																description: string;
															};
															email: {
																type: string;
																description: string;
															};
															name: {
																type: string;
																description: string;
															};
															image: {
																type: string;
																description: string;
															};
															emailVerified: {
																type: string;
																description: string;
															};
															createdAt: {
																type: string;
																description: string;
															};
															updatedAt: {
																type: string;
																description: string;
															};
														};
														required: string[];
													};
													status: {
														type: string;
														description: string;
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/verify-email";
			};
			sendVerificationEmail: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							email: string;
							callbackURL?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							email: import("zod").ZodEmail;
							callbackURL: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					metadata: {
						openapi: {
							description: string;
							requestBody: {
								content: {
									"application/json": {
										schema: {
											type: "object";
											properties: {
												email: {
													type: string;
													description: string;
													example: string;
												};
												callbackURL: {
													type: string;
													description: string;
													example: string;
													nullable: boolean;
												};
											};
											required: string[];
										};
									};
								};
							};
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													status: {
														type: string;
														description: string;
														example: boolean;
													};
												};
											};
										};
									};
								};
								"400": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													message: {
														type: string;
														description: string;
														example: string;
													};
												};
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/send-verification-email";
			};
			changeEmail: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							newEmail: string;
							callbackURL?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							newEmail: import("zod").ZodEmail;
							callbackURL: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					metadata: {
						openapi: {
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													status: {
														type: string;
														description: string;
													};
													message: {
														type: string;
														enum: string[];
														description: string;
														nullable: boolean;
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/change-email";
			};
			changePassword: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							newPassword: string;
							currentPassword: string;
							revokeOtherSessions?: boolean | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										token: string | null;
										user: {
											id: string;
											email: string;
											name: string;
											image: string | null | undefined;
											emailVerified: boolean;
											createdAt: Date;
											updatedAt: Date;
										};
									};
								}
							: {
									token: string | null;
									user: {
										id: string;
										email: string;
										name: string;
										image: string | null | undefined;
										emailVerified: boolean;
										createdAt: Date;
										updatedAt: Date;
									};
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							newPassword: import("zod").ZodString;
							currentPassword: import("zod").ZodString;
							revokeOtherSessions: import("zod").ZodOptional<import("zod").ZodBoolean>;
						},
						import("zod/v4/core").$strip
					>;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													token: {
														type: string;
														nullable: boolean;
														description: string;
													};
													user: {
														type: string;
														properties: {
															id: {
																type: string;
																description: string;
															};
															email: {
																type: string;
																format: string;
																description: string;
															};
															name: {
																type: string;
																description: string;
															};
															image: {
																type: string;
																format: string;
																nullable: boolean;
																description: string;
															};
															emailVerified: {
																type: string;
																description: string;
															};
															createdAt: {
																type: string;
																format: string;
																description: string;
															};
															updatedAt: {
																type: string;
																format: string;
																description: string;
															};
														};
														required: string[];
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/change-password";
			};
			setPassword: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							newPassword: string;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							newPassword: import("zod").ZodString;
						},
						import("zod/v4/core").$strip
					>;
					metadata: {
						SERVER_ONLY: true;
					};
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
				} & {
					use: any[];
				};
				path: "/set-password";
			};
			updateUser: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: Partial<
							import("better-auth").AdditionalUserFieldsInput<{
								database: (
									options: import("better-auth").BetterAuthOptions,
								) => import("better-auth").Adapter;
								trustedOrigins: any[];
								emailAndPassword: {
									enabled: true;
									disableSignUp: true;
								};
								secret: any;
								baseURL: any;
								user: {
									additionalFields: {
										role: {
											type: "string";
											required: false;
											defaultValue: string;
											input: false;
										};
									};
								};
								plugins: {
									id: "custom-session";
									endpoints: {
										getSession: {
											<
												AsResponse_1 extends boolean = false,
												ReturnHeaders_1 extends boolean = false,
											>(
												inputCtx_0: {
													body?: undefined;
												} & {
													method?: "GET" | undefined;
												} & {
													query?:
														| {
																disableCookieCache?: string | boolean | undefined;
																disableRefresh?: boolean | undefined;
														  }
														| undefined;
												} & {
													params?: Record<string, any>;
												} & {
													request?: Request;
												} & {
													headers: HeadersInit;
												} & {
													asResponse?: boolean;
													returnHeaders?: boolean;
													use?: import("better-auth").Middleware[];
													path?: string;
												} & {
													asResponse?: AsResponse_1 | undefined;
													returnHeaders?: ReturnHeaders_1 | undefined;
												},
											): Promise<
												[AsResponse_1] extends [true]
													? Response
													: [ReturnHeaders_1] extends [true]
														? {
																headers: Headers;
																response: {
																	user: {
																		role: any;
																		id: string;
																		email: string;
																		emailVerified: boolean;
																		name: string;
																		createdAt: Date;
																		updatedAt: Date;
																		image?: string | null | undefined;
																	};
																	session: {
																		id: string;
																		userId: string;
																		expiresAt: Date;
																		createdAt: Date;
																		updatedAt: Date;
																		token: string;
																		ipAddress?: string | null | undefined;
																		userAgent?: string | null | undefined;
																	};
																} | null;
															}
														: {
																user: {
																	role: any;
																	id: string;
																	email: string;
																	emailVerified: boolean;
																	name: string;
																	createdAt: Date;
																	updatedAt: Date;
																	image?: string | null | undefined;
																};
																session: {
																	id: string;
																	userId: string;
																	expiresAt: Date;
																	createdAt: Date;
																	updatedAt: Date;
																	token: string;
																	ipAddress?: string | null | undefined;
																	userAgent?: string | null | undefined;
																};
															} | null
											>;
											options: {
												method: "GET";
												query: import("zod").ZodOptional<
													import("zod").ZodObject<
														{
															disableCookieCache: import("zod").ZodOptional<
																import("zod").ZodUnion<
																	[
																		import("zod").ZodBoolean,
																		import("zod").ZodPipe<
																			import("zod").ZodString,
																			import("zod").ZodTransform<boolean, string>
																		>,
																	]
																>
															>;
															disableRefresh: import("zod").ZodOptional<import("zod").ZodBoolean>;
														},
														import("zod/v4/core").$strip
													>
												>;
												metadata: {
													CUSTOM_SESSION: boolean;
													openapi: {
														description: string;
														responses: {
															"200": {
																description: string;
																content: {
																	"application/json": {
																		schema: {
																			type: "array";
																			nullable: boolean;
																			items: {
																				$ref: string;
																			};
																		};
																	};
																};
															};
														};
													};
												};
												requireHeaders: true;
											} & {
												use: any[];
											};
											path: "/get-session";
										};
									};
								}[];
							}>
						> & {
							name?: string;
							image?: string;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodAny>;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					metadata: {
						$Infer: {
							body: Partial<
								import("better-auth").AdditionalUserFieldsInput<{
									database: (
										options: import("better-auth").BetterAuthOptions,
									) => import("better-auth").Adapter;
									trustedOrigins: any[];
									emailAndPassword: {
										enabled: true;
										disableSignUp: true;
									};
									secret: any;
									baseURL: any;
									user: {
										additionalFields: {
											role: {
												type: "string";
												required: false;
												defaultValue: string;
												input: false;
											};
										};
									};
									plugins: {
										id: "custom-session";
										endpoints: {
											getSession: {
												<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
													inputCtx_0: {
														body?: undefined;
													} & {
														method?: "GET" | undefined;
													} & {
														query?:
															| {
																	disableCookieCache?: string | boolean | undefined;
																	disableRefresh?: boolean | undefined;
															  }
															| undefined;
													} & {
														params?: Record<string, any>;
													} & {
														request?: Request;
													} & {
														headers: HeadersInit;
													} & {
														asResponse?: boolean;
														returnHeaders?: boolean;
														use?: import("better-auth").Middleware[];
														path?: string;
													} & {
														asResponse?: AsResponse | undefined;
														returnHeaders?: ReturnHeaders | undefined;
													},
												): Promise<
													[AsResponse] extends [true]
														? Response
														: [ReturnHeaders] extends [true]
															? {
																	headers: Headers;
																	response: {
																		user: {
																			role: any;
																			id: string;
																			email: string;
																			emailVerified: boolean;
																			name: string;
																			createdAt: Date;
																			updatedAt: Date;
																			image?: string | null | undefined;
																		};
																		session: {
																			id: string;
																			userId: string;
																			expiresAt: Date;
																			createdAt: Date;
																			updatedAt: Date;
																			token: string;
																			ipAddress?: string | null | undefined;
																			userAgent?: string | null | undefined;
																		};
																	} | null;
																}
															: {
																	user: {
																		role: any;
																		id: string;
																		email: string;
																		emailVerified: boolean;
																		name: string;
																		createdAt: Date;
																		updatedAt: Date;
																		image?: string | null | undefined;
																	};
																	session: {
																		id: string;
																		userId: string;
																		expiresAt: Date;
																		createdAt: Date;
																		updatedAt: Date;
																		token: string;
																		ipAddress?: string | null | undefined;
																		userAgent?: string | null | undefined;
																	};
																} | null
												>;
												options: {
													method: "GET";
													query: import("zod").ZodOptional<
														import("zod").ZodObject<
															{
																disableCookieCache: import("zod").ZodOptional<
																	import("zod").ZodUnion<
																		[
																			import("zod").ZodBoolean,
																			import("zod").ZodPipe<
																				import("zod").ZodString,
																				import("zod").ZodTransform<boolean, string>
																			>,
																		]
																	>
																>;
																disableRefresh: import("zod").ZodOptional<import("zod").ZodBoolean>;
															},
															import("zod/v4/core").$strip
														>
													>;
													metadata: {
														CUSTOM_SESSION: boolean;
														openapi: {
															description: string;
															responses: {
																"200": {
																	description: string;
																	content: {
																		"application/json": {
																			schema: {
																				type: "array";
																				nullable: boolean;
																				items: {
																					$ref: string;
																				};
																			};
																		};
																	};
																};
															};
														};
													};
													requireHeaders: true;
												} & {
													use: any[];
												};
												path: "/get-session";
											};
										};
									}[];
								}>
							> & {
								name?: string;
								image?: string;
							};
						};
						openapi: {
							description: string;
							requestBody: {
								content: {
									"application/json": {
										schema: {
											type: "object";
											properties: {
												name: {
													type: string;
													description: string;
												};
												image: {
													type: string;
													description: string;
												};
											};
										};
									};
								};
							};
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													status: {
														type: string;
														description: string;
													};
												};
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/update-user";
			};
			deleteUser: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							callbackURL?: string | undefined;
							password?: string | undefined;
							token?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										success: boolean;
										message: string;
									};
								}
							: {
									success: boolean;
									message: string;
								}
				>;
				options: {
					method: "POST";
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					body: import("zod").ZodObject<
						{
							callbackURL: import("zod").ZodOptional<import("zod").ZodString>;
							password: import("zod").ZodOptional<import("zod").ZodString>;
							token: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													success: {
														type: string;
														description: string;
													};
													message: {
														type: string;
														enum: string[];
														description: string;
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/delete-user";
			};
			forgetPasswordCallback: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?: undefined;
					} & {
						method?: "GET" | undefined;
					} & {
						query: {
							callbackURL: string;
						};
					} & {
						params: {
							token: string;
						};
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: never;
								}
							: never
				>;
				options: {
					method: "GET";
					query: import("zod").ZodObject<
						{
							callbackURL: import("zod").ZodString;
						},
						import("zod/v4/core").$strip
					>;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<void>)[];
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													token: {
														type: string;
													};
												};
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/reset-password/:token";
			};
			requestPasswordReset: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							email: string;
							redirectTo?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							email: import("zod").ZodEmail;
							redirectTo: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													status: {
														type: string;
													};
													message: {
														type: string;
													};
												};
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/request-password-reset";
			};
			requestPasswordResetCallback: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?: undefined;
					} & {
						method?: "GET" | undefined;
					} & {
						query: {
							callbackURL: string;
						};
					} & {
						params: {
							token: string;
						};
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: never;
								}
							: never
				>;
				options: {
					method: "GET";
					query: import("zod").ZodObject<
						{
							callbackURL: import("zod").ZodString;
						},
						import("zod/v4/core").$strip
					>;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<void>)[];
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													token: {
														type: string;
													};
												};
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/reset-password/:token";
			};
			listSessions: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?: undefined;
					} & {
						method?: "GET" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: import("better-auth").Prettify<{
										id: string;
										userId: string;
										expiresAt: Date;
										createdAt: Date;
										updatedAt: Date;
										token: string;
										ipAddress?: string | null | undefined | undefined;
										userAgent?: string | null | undefined | undefined;
									}>[];
								}
							: import("better-auth").Prettify<{
									id: string;
									userId: string;
									expiresAt: Date;
									createdAt: Date;
									updatedAt: Date;
									token: string;
									ipAddress?: string | null | undefined | undefined;
									userAgent?: string | null | undefined | undefined;
								}>[]
				>;
				options: {
					method: "GET";
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					requireHeaders: true;
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "array";
												items: {
													$ref: string;
												};
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/list-sessions";
			};
			revokeSession: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							token: string;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							token: import("zod").ZodString;
						},
						import("zod/v4/core").$strip
					>;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					requireHeaders: true;
					metadata: {
						openapi: {
							description: string;
							requestBody: {
								content: {
									"application/json": {
										schema: {
											type: "object";
											properties: {
												token: {
													type: string;
													description: string;
												};
											};
											required: string[];
										};
									};
								};
							};
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													status: {
														type: string;
														description: string;
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/revoke-session";
			};
			revokeSessions: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?: undefined;
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					requireHeaders: true;
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													status: {
														type: string;
														description: string;
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/revoke-sessions";
			};
			revokeOtherSessions: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?: undefined;
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					requireHeaders: true;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													status: {
														type: string;
														description: string;
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/revoke-other-sessions";
			};
			linkSocialAccount: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							provider: unknown;
							callbackURL?: string | undefined;
							idToken?:
								| {
										token: string;
										nonce?: string | undefined;
										accessToken?: string | undefined;
										refreshToken?: string | undefined;
										scopes?: string[] | undefined;
								  }
								| undefined;
							requestSignUp?: boolean | undefined;
							scopes?: string[] | undefined;
							errorCallbackURL?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										url: string;
										redirect: boolean;
									};
								}
							: {
									url: string;
									redirect: boolean;
								}
				>;
				options: {
					method: "POST";
					requireHeaders: true;
					body: import("zod").ZodObject<
						{
							callbackURL: import("zod").ZodOptional<import("zod").ZodString>;
							provider: import("zod").ZodType<
								| "apple"
								| (string & {})
								| "discord"
								| "facebook"
								| "github"
								| "microsoft"
								| "google"
								| "huggingface"
								| "slack"
								| "spotify"
								| "twitch"
								| "twitter"
								| "dropbox"
								| "kick"
								| "linear"
								| "linkedin"
								| "gitlab"
								| "tiktok"
								| "reddit"
								| "roblox"
								| "vk"
								| "zoom"
								| "notion",
								unknown,
								import("zod/v4/core").$ZodTypeInternals<
									| "apple"
									| (string & {})
									| "discord"
									| "facebook"
									| "github"
									| "microsoft"
									| "google"
									| "huggingface"
									| "slack"
									| "spotify"
									| "twitch"
									| "twitter"
									| "dropbox"
									| "kick"
									| "linear"
									| "linkedin"
									| "gitlab"
									| "tiktok"
									| "reddit"
									| "roblox"
									| "vk"
									| "zoom"
									| "notion",
									unknown
								>
							>;
							idToken: import("zod").ZodOptional<
								import("zod").ZodObject<
									{
										token: import("zod").ZodString;
										nonce: import("zod").ZodOptional<import("zod").ZodString>;
										accessToken: import("zod").ZodOptional<import("zod").ZodString>;
										refreshToken: import("zod").ZodOptional<import("zod").ZodString>;
										scopes: import("zod").ZodOptional<
											import("zod").ZodArray<import("zod").ZodString>
										>;
									},
									import("zod/v4/core").$strip
								>
							>;
							requestSignUp: import("zod").ZodOptional<import("zod").ZodBoolean>;
							scopes: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
							errorCallbackURL: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													url: {
														type: string;
														description: string;
													};
													redirect: {
														type: string;
														description: string;
													};
													status: {
														type: string;
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/link-social";
			};
			listUserAccounts: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0?:
						| ({
								body?: undefined;
						  } & {
								method?: "GET" | undefined;
						  } & {
								query?: Record<string, any> | undefined;
						  } & {
								params?: Record<string, any>;
						  } & {
								request?: Request;
						  } & {
								headers?: HeadersInit;
						  } & {
								asResponse?: boolean;
								returnHeaders?: boolean;
								use?: import("better-auth").Middleware[];
								path?: string;
						  } & {
								asResponse?: AsResponse | undefined;
								returnHeaders?: ReturnHeaders | undefined;
						  })
						| undefined,
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										id: string;
										provider: string;
										createdAt: Date;
										updatedAt: Date;
										accountId: string;
										scopes: string[];
									}[];
								}
							: {
									id: string;
									provider: string;
									createdAt: Date;
									updatedAt: Date;
									accountId: string;
									scopes: string[];
								}[]
				>;
				options: {
					method: "GET";
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "array";
												items: {
													type: string;
													properties: {
														id: {
															type: string;
														};
														provider: {
															type: string;
														};
														createdAt: {
															type: string;
															format: string;
														};
														updatedAt: {
															type: string;
															format: string;
														};
													};
													accountId: {
														type: string;
													};
													scopes: {
														type: string;
														items: {
															type: string;
														};
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/list-accounts";
			};
			deleteUserCallback: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?: undefined;
					} & {
						method?: "GET" | undefined;
					} & {
						query: {
							token: string;
							callbackURL?: string | undefined;
						};
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										success: boolean;
										message: string;
									};
								}
							: {
									success: boolean;
									message: string;
								}
				>;
				options: {
					method: "GET";
					query: import("zod").ZodObject<
						{
							token: import("zod").ZodString;
							callbackURL: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<void>)[];
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													success: {
														type: string;
														description: string;
													};
													message: {
														type: string;
														enum: string[];
														description: string;
													};
												};
												required: string[];
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/delete-user/callback";
			};
			unlinkAccount: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							providerId: string;
							accountId?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										status: boolean;
									};
								}
							: {
									status: boolean;
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							providerId: import("zod").ZodString;
							accountId: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													status: {
														type: string;
													};
												};
											};
										};
									};
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/unlink-account";
			};
			refreshToken: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							providerId: string;
							accountId?: string | undefined;
							userId?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: import("better-auth").OAuth2Tokens;
								}
							: import("better-auth").OAuth2Tokens
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							providerId: import("zod").ZodString;
							accountId: import("zod").ZodOptional<import("zod").ZodString>;
							userId: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					metadata: {
						openapi: {
							description: string;
							responses: {
								200: {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													tokenType: {
														type: string;
													};
													idToken: {
														type: string;
													};
													accessToken: {
														type: string;
													};
													refreshToken: {
														type: string;
													};
													accessTokenExpiresAt: {
														type: string;
														format: string;
													};
													refreshTokenExpiresAt: {
														type: string;
														format: string;
													};
												};
											};
										};
									};
								};
								400: {
									description: string;
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/refresh-token";
			};
			getAccessToken: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							providerId: string;
							accountId?: string | undefined;
							userId?: string | undefined;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										accessToken: string;
										accessTokenExpiresAt: Date | undefined;
										scopes: string[];
										idToken: string | undefined;
									};
								}
							: {
									accessToken: string;
									accessTokenExpiresAt: Date | undefined;
									scopes: string[];
									idToken: string | undefined;
								}
				>;
				options: {
					method: "POST";
					body: import("zod").ZodObject<
						{
							providerId: import("zod").ZodString;
							accountId: import("zod").ZodOptional<import("zod").ZodString>;
							userId: import("zod").ZodOptional<import("zod").ZodString>;
						},
						import("zod/v4/core").$strip
					>;
					metadata: {
						openapi: {
							description: string;
							responses: {
								200: {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													tokenType: {
														type: string;
													};
													idToken: {
														type: string;
													};
													accessToken: {
														type: string;
													};
													refreshToken: {
														type: string;
													};
													accessTokenExpiresAt: {
														type: string;
														format: string;
													};
													refreshTokenExpiresAt: {
														type: string;
														format: string;
													};
												};
											};
										};
									};
								};
								400: {
									description: string;
								};
							};
						};
					};
				} & {
					use: any[];
				};
				path: "/get-access-token";
			};
			accountInfo: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body: {
							accountId: string;
						};
					} & {
						method?: "POST" | undefined;
					} & {
						query?: Record<string, any> | undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers?: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										user: {
											id: string;
											name?: string;
											email?: string | null;
											image?: string;
											emailVerified: boolean;
										};
										data: Record<string, any>;
									} | null;
								}
							: {
									user: {
										id: string;
										name?: string;
										email?: string | null;
										image?: string;
										emailVerified: boolean;
									};
									data: Record<string, any>;
								} | null
				>;
				options: {
					method: "POST";
					use: ((
						inputContext: import("better-auth").MiddlewareInputContext<
							import("better-auth").MiddlewareOptions
						>,
					) => Promise<{
						session: {
							session: Record<string, any> & {
								id: string;
								userId: string;
								expiresAt: Date;
								createdAt: Date;
								updatedAt: Date;
								token: string;
								ipAddress?: string | null | undefined;
								userAgent?: string | null | undefined;
							};
							user: Record<string, any> & {
								id: string;
								email: string;
								emailVerified: boolean;
								name: string;
								createdAt: Date;
								updatedAt: Date;
								image?: string | null | undefined;
							};
						};
					}>)[];
					metadata: {
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "object";
												properties: {
													user: {
														type: string;
														properties: {
															id: {
																type: string;
															};
															name: {
																type: string;
															};
															email: {
																type: string;
															};
															image: {
																type: string;
															};
															emailVerified: {
																type: string;
															};
														};
														required: string[];
													};
													data: {
														type: string;
														properties: {};
														additionalProperties: boolean;
													};
												};
												required: string[];
												additionalProperties: boolean;
											};
										};
									};
								};
							};
						};
					};
					body: import("zod").ZodObject<
						{
							accountId: import("zod").ZodString;
						},
						import("zod/v4/core").$strip
					>;
				} & {
					use: any[];
				};
				path: "/account-info";
			};
		} & {
			getSession: {
				<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
					inputCtx_0: {
						body?: undefined;
					} & {
						method?: "GET" | undefined;
					} & {
						query?:
							| {
									disableCookieCache?: string | boolean | undefined;
									disableRefresh?: boolean | undefined;
							  }
							| undefined;
					} & {
						params?: Record<string, any>;
					} & {
						request?: Request;
					} & {
						headers: HeadersInit;
					} & {
						asResponse?: boolean;
						returnHeaders?: boolean;
						use?: import("better-auth").Middleware[];
						path?: string;
					} & {
						asResponse?: AsResponse | undefined;
						returnHeaders?: ReturnHeaders | undefined;
					},
				): Promise<
					[AsResponse] extends [true]
						? Response
						: [ReturnHeaders] extends [true]
							? {
									headers: Headers;
									response: {
										user: {
											role: any;
											id: string;
											email: string;
											emailVerified: boolean;
											name: string;
											createdAt: Date;
											updatedAt: Date;
											image?: string | null | undefined;
										};
										session: {
											id: string;
											userId: string;
											expiresAt: Date;
											createdAt: Date;
											updatedAt: Date;
											token: string;
											ipAddress?: string | null | undefined;
											userAgent?: string | null | undefined;
										};
									} | null;
								}
							: {
									user: {
										role: any;
										id: string;
										email: string;
										emailVerified: boolean;
										name: string;
										createdAt: Date;
										updatedAt: Date;
										image?: string | null | undefined;
									};
									session: {
										id: string;
										userId: string;
										expiresAt: Date;
										createdAt: Date;
										updatedAt: Date;
										token: string;
										ipAddress?: string | null | undefined;
										userAgent?: string | null | undefined;
									};
								} | null
				>;
				options: {
					method: "GET";
					query: import("zod").ZodOptional<
						import("zod").ZodObject<
							{
								disableCookieCache: import("zod").ZodOptional<
									import("zod").ZodUnion<
										[
											import("zod").ZodBoolean,
											import("zod").ZodPipe<
												import("zod").ZodString,
												import("zod").ZodTransform<boolean, string>
											>,
										]
									>
								>;
								disableRefresh: import("zod").ZodOptional<import("zod").ZodBoolean>;
							},
							import("zod/v4/core").$strip
						>
					>;
					metadata: {
						CUSTOM_SESSION: boolean;
						openapi: {
							description: string;
							responses: {
								"200": {
									description: string;
									content: {
										"application/json": {
											schema: {
												type: "array";
												nullable: boolean;
												items: {
													$ref: string;
												};
											};
										};
									};
								};
							};
						};
					};
					requireHeaders: true;
				} & {
					use: any[];
				};
				path: "/get-session";
			};
		}
	>;
	options: {
		database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").Adapter;
		trustedOrigins: any[];
		emailAndPassword: {
			enabled: true;
			disableSignUp: true;
		};
		secret: any;
		baseURL: any;
		user: {
			additionalFields: {
				role: {
					type: "string";
					required: false;
					defaultValue: string;
					input: false;
				};
			};
		};
		plugins: {
			id: "custom-session";
			endpoints: {
				getSession: {
					<AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(
						inputCtx_0: {
							body?: undefined;
						} & {
							method?: "GET" | undefined;
						} & {
							query?:
								| {
										disableCookieCache?: string | boolean | undefined;
										disableRefresh?: boolean | undefined;
								  }
								| undefined;
						} & {
							params?: Record<string, any>;
						} & {
							request?: Request;
						} & {
							headers: HeadersInit;
						} & {
							asResponse?: boolean;
							returnHeaders?: boolean;
							use?: import("better-auth").Middleware[];
							path?: string;
						} & {
							asResponse?: AsResponse | undefined;
							returnHeaders?: ReturnHeaders | undefined;
						},
					): Promise<
						[AsResponse] extends [true]
							? Response
							: [ReturnHeaders] extends [true]
								? {
										headers: Headers;
										response: {
											user: {
												role: any;
												id: string;
												email: string;
												emailVerified: boolean;
												name: string;
												createdAt: Date;
												updatedAt: Date;
												image?: string | null | undefined;
											};
											session: {
												id: string;
												userId: string;
												expiresAt: Date;
												createdAt: Date;
												updatedAt: Date;
												token: string;
												ipAddress?: string | null | undefined;
												userAgent?: string | null | undefined;
											};
										} | null;
									}
								: {
										user: {
											role: any;
											id: string;
											email: string;
											emailVerified: boolean;
											name: string;
											createdAt: Date;
											updatedAt: Date;
											image?: string | null | undefined;
										};
										session: {
											id: string;
											userId: string;
											expiresAt: Date;
											createdAt: Date;
											updatedAt: Date;
											token: string;
											ipAddress?: string | null | undefined;
											userAgent?: string | null | undefined;
										};
									} | null
					>;
					options: {
						method: "GET";
						query: import("zod").ZodOptional<
							import("zod").ZodObject<
								{
									disableCookieCache: import("zod").ZodOptional<
										import("zod").ZodUnion<
											[
												import("zod").ZodBoolean,
												import("zod").ZodPipe<
													import("zod").ZodString,
													import("zod").ZodTransform<boolean, string>
												>,
											]
										>
									>;
									disableRefresh: import("zod").ZodOptional<import("zod").ZodBoolean>;
								},
								import("zod/v4/core").$strip
							>
						>;
						metadata: {
							CUSTOM_SESSION: boolean;
							openapi: {
								description: string;
								responses: {
									"200": {
										description: string;
										content: {
											"application/json": {
												schema: {
													type: "array";
													nullable: boolean;
													items: {
														$ref: string;
													};
												};
											};
										};
									};
								};
							};
						};
						requireHeaders: true;
					} & {
						use: any[];
					};
					path: "/get-session";
				};
			};
		}[];
	};
	$context: Promise<import("better-auth").AuthContext>;
	$Infer: {
		Session: {
			session: {
				id: string;
				userId: string;
				expiresAt: Date;
				createdAt: Date;
				updatedAt: Date;
				token: string;
				ipAddress?: string | null | undefined;
				userAgent?: string | null | undefined;
			};
			user: {
				id: string;
				email: string;
				emailVerified: boolean;
				name: string;
				createdAt: Date;
				updatedAt: Date;
				image?: string | null | undefined;
				role: string | null | undefined;
			};
		};
	};
	$ERROR_CODES: {
		USER_NOT_FOUND: string;
		FAILED_TO_CREATE_USER: string;
		FAILED_TO_CREATE_SESSION: string;
		FAILED_TO_UPDATE_USER: string;
		FAILED_TO_GET_SESSION: string;
		INVALID_PASSWORD: string;
		INVALID_EMAIL: string;
		INVALID_EMAIL_OR_PASSWORD: string;
		SOCIAL_ACCOUNT_ALREADY_LINKED: string;
		PROVIDER_NOT_FOUND: string;
		INVALID_TOKEN: string;
		ID_TOKEN_NOT_SUPPORTED: string;
		FAILED_TO_GET_USER_INFO: string;
		USER_EMAIL_NOT_FOUND: string;
		EMAIL_NOT_VERIFIED: string;
		PASSWORD_TOO_SHORT: string;
		PASSWORD_TOO_LONG: string;
		USER_ALREADY_EXISTS: string;
		EMAIL_CAN_NOT_BE_UPDATED: string;
		CREDENTIAL_ACCOUNT_NOT_FOUND: string;
		SESSION_EXPIRED: string;
		FAILED_TO_UNLINK_LAST_ACCOUNT: string;
		ACCOUNT_NOT_FOUND: string;
		USER_ALREADY_HAS_PASSWORD: string;
	};
};

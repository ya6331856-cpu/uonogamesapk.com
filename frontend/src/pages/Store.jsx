          {/* TOP 3 APPS TODAY - #1 IN CENTER FRONT & #2, #3 ON SIDES */}
          {top3.length > 0 && !search && category === "All" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-display font-bold text-sm text-[#111111] flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-[#FFC107]" /> Top 3 Apps Today
                </h3>
                <span className="text-xs text-[#777777]">Editor's Picks</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 items-end">
                {/* #2 GAME (Left Side) */}
                {top3[1] && (
                  <div 
                    onClick={() => navigate(`/${top3[1].slug || `app/${top3[1].id}`}`, { state: { app: top3[1] } })}
                    className="relative cursor-pointer rounded-[20px] border border-[#E5E7EB] bg-white p-3 flex flex-col items-center text-center justify-between shadow-sm hover:shadow-md transition-all min-h-[220px] opacity-95 scale-[0.97]"
                  >
                    <div className="absolute -left-1.5 -top-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white shadow-md border-2 border-white" style={{ background: "linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)" }}>
                      <Crown className="h-2.5 w-2.5 text-white fill-white" />
                      <span>#2</span>
                    </div>

                    <div className="flex flex-col items-center w-full mt-2">
                      <div className="relative">
                        <AppIcon src={resolveUrl(top3[1].icon_url)} alt={top3[1].name} className="h-12 w-12 rounded-[12px] ring-1 ring-black/5 object-cover shadow-sm" />
                        <span className="absolute -right-1.5 -top-1 rounded-full bg-red-500 px-1 py-0.5 text-[6px] font-extrabold text-white shadow-sm leading-none">NEW</span>
                      </div>

                      <h4 className="mt-2 line-clamp-1 font-display text-[11px] font-bold text-[#111111] w-full">{top3[1].name}</h4>

                      <div className="mt-1 space-y-0.5 w-full">
                        <div className="flex items-center justify-center gap-0.5 text-[8px] font-semibold text-[#555555]">
                          <Star className="h-2 w-2 fill-[#FFC107] text-[#FFC107]" />
                          <span>{top3[1].rating?.toFixed(1) || "4.8"}</span>
                        </div>
                        {top3[1].signup_bonus && (
                          <div className="flex items-center justify-center gap-0.5 text-[8px] font-extrabold text-[#D97706] truncate">
                            <Gift className="h-2 w-2 shrink-0" /> {top3[1].signup_bonus}
                          </div>
                        )}
                        {top3[1].min_withdraw && (
                          <div className="text-[8px] font-bold text-[#16A34A] truncate">Min {top3[1].min_withdraw}</div>
                        )}
                      </div>
                    </div>

                    <RippleButton onClick={(e) => { e.stopPropagation(); handleDownload(top3[1]); }} className="mt-2 w-full flex items-center justify-center gap-1 rounded-full bg-[#FFC107] py-1.5 text-[9px] font-bold text-[#111111] shadow-sm hover:bg-[#FFB300]">
                      <Download className="h-2.5 w-2.5" /> Get
                    </RippleButton>
                  </div>
                )}

                {/* #1 GAME (Center Front & Prominent) */}
                {top3[0] && (
                  <div 
                    onClick={() => navigate(`/${top3[0].slug || `app/${top3[0].id}`}`, { state: { app: top3[0] } })}
                    className="relative z-10 cursor-pointer rounded-[22px] border-2 border-[#FFC107] bg-gradient-to-b from-[#FFFDF5] to-white p-3.5 flex flex-col items-center text-center justify-between shadow-[0_8px_24px_rgba(255,193,7,0.25)] hover:shadow-lg transition-all min-h-[245px] -translate-y-2"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black text-white shadow-md border-2 border-white" style={{ background: "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)" }}>
                      <Crown className="h-3 w-3 text-white fill-white" />
                      <span>#1 VIP</span>
                    </div>

                    <div className="flex flex-col items-center w-full mt-2">
                      <div className="relative">
                        <AppIcon src={resolveUrl(top3[0].icon_url)} alt={top3[0].name} className="h-15 w-15 rounded-[14px] ring-1 ring-black/5 object-cover shadow-sm" />
                        <span className="absolute -right-1.5 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] font-extrabold text-white shadow-sm leading-none">NEW</span>
                      </div>

                      <h4 className="mt-2 line-clamp-1 font-display text-xs font-extrabold text-[#111111] w-full">{top3[0].name}</h4>

                      <div className="mt-1 space-y-0.5 w-full">
                        <div className="flex items-center justify-center gap-0.5 text-[9px] font-semibold text-[#555555]">
                          <Star className="h-2.5 w-2.5 fill-[#FFC107] text-[#FFC107]" />
                          <span>{top3[0].rating?.toFixed(1) || "4.8"}</span>
                        </div>
                        {top3[0].signup_bonus && (
                          <div className="flex items-center justify-center gap-0.5 text-[9px] font-extrabold text-[#D97706] truncate">
                            <Gift className="h-2.5 w-2.5 shrink-0" /> {top3[0].signup_bonus}
                          </div>
                        )}
                        {top3[0].min_withdraw && (
                          <div className="text-[9px] font-bold text-[#16A34A] truncate">Min {top3[0].min_withdraw}</div>
                        )}
                      </div>
                    </div>

                    <RippleButton onClick={(e) => { e.stopPropagation(); handleDownload(top3[0]); }} className="mt-2.5 w-full flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#FFC107] to-[#FF9800] py-1.5 text-[10px] font-bold text-white shadow-md hover:opacity-95">
                      <Download className="h-3 w-3" /> Get
                    </RippleButton>
                  </div>
                )}

                {/* #3 GAME (Right Side) */}
                {top3[2] && (
                  <div 
                    onClick={() => navigate(`/${top3[2].slug || `app/${top3[2].id}`}`, { state: { app: top3[2] } })}
                    className="relative cursor-pointer rounded-[20px] border border-[#E5E7EB] bg-white p-3 flex flex-col items-center text-center justify-between shadow-sm hover:shadow-md transition-all min-h-[220px] opacity-95 scale-[0.97]"
                  >
                    <div className="absolute -left-1.5 -top-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white shadow-md border-2 border-white" style={{ background: "linear-gradient(135deg, #E65100 0%, #BF360C 100%)" }}>
                      <Crown className="h-2.5 w-2.5 text-white fill-white" />
                      <span>#3</span>
                    </div>

                    <div className="flex flex-col items-center w-full mt-2">
                      <div className="relative">
                        <AppIcon src={resolveUrl(top3[2].icon_url)} alt={top3[2].name} className="h-12 w-12 rounded-[12px] ring-1 ring-black/5 object-cover shadow-sm" />
                        <span className="absolute -right-1.5 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[6px] font-extrabold text-white shadow-sm leading-none">NEW</span>
                      </div>

                      <h4 className="mt-2 line-clamp-1 font-display text-[11px] font-bold text-[#111111] w-full">{top3[2].name}</h4>

                      <div className="mt-1 space-y-0.5 w-full">
                        <div className="flex items-center justify-center gap-0.5 text-[8px] font-semibold text-[#555555]">
                          <Star className="h-2 w-2 fill-[#FFC107] text-[#FFC107]" />
                          <span>{top3[2].rating?.toFixed(1) || "4.8"}</span>
                        </div>
                        {top3[2].signup_bonus && (
                          <div className="flex items-center justify-center gap-0.5 text-[8px] font-extrabold text-[#D97706] truncate">
                            <Gift className="h-2 w-2 shrink-0" /> {top3[2].signup_bonus}
                          </div>
                        )}
                        {top3[2].min_withdraw && (
                          <div className="text-[8px] font-bold text-[#16A34A] truncate">Min {top3[2].min_withdraw}</div>
                        )}
                      </div>
                    </div>

                    <RippleButton onClick={(e) => { e.stopPropagation(); handleDownload(top3[2]); }} className="mt-2 w-full flex items-center justify-center gap-1 rounded-full bg-[#FFC107] py-1.5 text-[9px] font-bold text-[#111111] shadow-sm hover:bg-[#FFB300]">
                      <Download className="h-2.5 w-2.5" /> Get
                    </RippleButton>
                  </div>
                )}
              </div>
            </div>
          )}

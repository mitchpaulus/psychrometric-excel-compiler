Sub AddOrUpdateLambda(Name as String, RefersTo as String)
    On Error Resume Next
    ActiveWorkbook.Names(Name).Delete
    On Error GoTo 0
    ActiveWorkbook.Names.Add Name:=Name, RefersTo:=RefersTo
End Sub

Sub AddPsyLambdas
    AddOrUpdateLambda Name := "Pws", RefersTo:= "=LAMBDA(T_F,IF(T_F>=32,LET(T_R,T_F+459.67,n_1,1167.0521452767,n_2,-724213.16703206,n_3,-17.073846940092,n_4,12020.824702470,n_5,-3232555.0322333,n_6,14.915108613530,n_7,-4823.2657361591,n_8,405113.40542057,n_9,-0.23855557567849,n_10,650.17534844798,n_11,0.55555555555556,theta,n_11*T_R+(n_9/(n_11*T_R-n_10)),A,theta*theta+n_1*theta+n_2,B,n_3*theta*theta+n_4*theta+n_5,C,n_6*theta*theta+n_7*theta+n_8,145.03774*((2*C)/(((B*B-4*A*C)^0.5)-B))^4),LET(T_R,T_F+459.67,a_1,-21.2144006,a_2,27.3203819,a_3,-6.10598130,b_1,0.00333333333,b_2,1.20666667,b_3,1.70333333,theta,T_R/491.688,0.08871335*EXP((1/theta*(a_1*(theta^b_1)+a_2*(theta^b_2)+a_3*(theta^b_3)))))))"
    AddOrUpdateLambda Name := "W_Pw", RefersTo:= "=LAMBDA(Pw, [Pt], LET(Pta, IF(ISOMITTED(Pt), 14.696, Pt), (0.621945 * Pw) / (Pta - Pw)))"
    AddOrUpdateLambda Name := "Ws_T", RefersTo:= "=LAMBDA(T, [Pt], LET(Pta, IF(ISOMITTED(Pt), 14.696, Pt), W_Pw(Pws(T), Pta)))"
    AddOrUpdateLambda Name := "Pw_Tdb_RH", RefersTo:= "=LAMBDA(Tdb, RH, Pws(Tdb) * RH)"
    AddOrUpdateLambda Name := "W_Tdb_RH", RefersTo:= "=LAMBDA(Tdb, RH, [Pt], LET(Pta, IF(ISOMITTED(Pt), 14.696, Pt), Pw_i, Pw_Tdb_RH(Tdb, RH), W_Pw(Pw_i, Pta)))"
    AddOrUpdateLambda Name := "Tdp_Pw_Hi", RefersTo:= "=LAMBDA(Pw, LET( n_1, 0.11670521452767E+4, n_2, -0.72421316703206E+6, n_3, -0.17073846940092E+2, n_4, 0.12020824702470E+5, n_5, -0.32325550322333E+7, n_6, 0.14915108613530E+2, n_7, -0.48232657361591E+4, n_8,0.40511340542057E+6, n_9,-0.23855557567849, n_10,0.65017534844798E+3, beta, (Pw / 145.03774)^(0.25), E, beta*beta + n_3 * beta + n_6, F, n_1*beta*beta + n_4*beta + n_7, G, n_2*beta*beta + n_5*beta + n_8, D, (2*G) / ((-F) - (( F*F - 4 *E*G )^(0.5)) ), 0.9 * ( n_10 + D - (( ((n_10 + D)^2) - 4 * (n_9 + n_10 * D))^(0.5))) - 459.67))"
    AddOrUpdateLambda Name := "Tdp_Pw_Lo", RefersTo:= "=LAMBDA(Pw, LET( d_0, 0.2125733930680444E3, d_1, -0.1111829158329247E2, d_2, 0.10395548811, d_3, 0.2129587161785930E-5, e_0, 0.1E1, e_1, -0.8689545484617577E-1, e_2, 0.2295161845152704E-2, e_3, -0.1748895897772460E-4, pi_calc, LN(6894.757 * Pw), (1.8 * (d_0 + d_1 * pi_calc + d_2 * pi_calc*pi_calc + d_3 * pi_calc*pi_calc*pi_calc) / (e_0 + e_1 * pi_calc + e_2 * pi_calc*pi_calc + e_3 * pi_calc*pi_calc*pi_calc))-459.67))"
    AddOrUpdateLambda Name := "Tdp_Pw", RefersTo:= "=LAMBDA(Pw, IF(Pw >= 0.08865, Tdp_Pw_Hi(Pw), Tdp_Pw_Lo(Pw)))"
    AddOrUpdateLambda Name := "Pw_W", RefersTo:= "=LAMBDA(W, [Pt], LET(Pta, IF(ISOMITTED(Pt), 14.696, Pt), (200000*Pta*W)/(200000*W+124389)))"
    AddOrUpdateLambda Name := "Tdp_W", RefersTo:= "=LAMBDA(W, [Pt], LET(Pta, IF(ISOMITTED(Pt), 14.696, Pt), Pw, Pw_W(W, Pta), Tdp_Pw(Pw)))"
    AddOrUpdateLambda Name := "h_Tdb_W", RefersTo:= "=LAMBDA(Tdb, W, 0.24 * Tdb + W*(1061 + 0.444*Tdb))"
    AddOrUpdateLambda Name := "W_Tdb_Tdp", RefersTo:= "=LAMBDA(Tdb, Tdp, [Pt], LET(Pta, IF(ISOMITTED(Pt), 14.696, Pt), Ws_T(Tdp, Pta)))"
    AddOrUpdateLambda Name := "h_Tdb_Tdp", RefersTo := "=LAMBDA( Tdb, Tdp, [Pt], LET( Pta, IF(ISOMITTED(Pt), 14.696, Pt), W, W_Tdb_Tdp(Tdb, Tdp, Pta), h_Tdb_W(Tdb, W)))"
    AddOrUpdateLambda Name := "RH_Tdb_Tdp", RefersTo := "=LAMBDA(Tdb, Tdp, Pws(Tdp) / Pws(Tdb))"
    AddOrUpdateLambda Name := "Tdp_Tdb_RH", RefersTo := "=LAMBDA(Tdb, RH, LET(Pw, Pws(Tdb) * RH, Tdp_Pw(Pw)))"
End Sub

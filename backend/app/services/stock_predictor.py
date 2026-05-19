import pandas as pd

def calculate_stock_risk(sales_df, stock_df, suppliers_df):

    results = []

    grouped_sales = sales_df.groupby("referencia")["cantidad_vendida"].mean()

    for _, stock_row in stock_df.iterrows():

        referencia = stock_row["referencia"]
        stock_actual = stock_row["stock_actual"]

        avg_daily_sales = grouped_sales.get(referencia, 0)

        supplier_info = suppliers_df[suppliers_df["referencia"] == referencia]

        if supplier_info.empty:
            lead_time = 7
        else:
            lead_time = supplier_info.iloc[0]["lead_time_dias"]

        if avg_daily_sales == 0:
            days_left = 999
        else:
            days_left = stock_actual / avg_daily_sales

        risk = "HIGH" if days_left < lead_time else "OK"

        suggested_order = int(avg_daily_sales * 30)

        results.append({
            "referencia": referencia,
            "stock_actual": stock_actual,
            "ventas_diarias": round(avg_daily_sales, 2),
            "dias_restantes": round(days_left, 2),
            "lead_time": lead_time,
            "riesgo": risk,
            "pedido_sugerido": suggested_order
        })

    return pd.DataFrame(results)
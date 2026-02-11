// app/src/main/java/com/expensetracker/ui/dashboard/DashboardScreen.kt
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel = viewModel(),
    navController: NavController
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Scaffold(
        topBar = { ExpenseTrackerTopBar(title = "Dashboard") },
        floatingActionButton = {
            FloatingActionButton(onClick = { navController.navigate("add_transaction") }) {
                Icon(Icons.Default.Add, contentDescription = "Add Transaction")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // Filters
            DashboardFilters(
                dateRange = uiState.dateRange,
                onDateRangeChange = { viewModel.updateDateRange(it) },
                selectedCategories = uiState.selectedCategories,
                onCategorySelection = { viewModel.toggleCategory(it) }
            )
            
            // Summary Cards
            SummaryCards(
                income = uiState.totalIncome,
                expenses = uiState.totalExpenses,
                savings = uiState.savings,
                currency = uiState.currency
            )
            
            // Charts
            ExpenseByCategoryChart(categories = uiState.expenseByCategory)
            IncomeExpenseTrendChart(trendData = uiState.trendData)
            BudgetComparisonChart(budgetData = uiState.budgetComparison)
            
            // AI Insights
            AIInsightsPanel(insights = uiState.aiInsights)
            
            // Investment Overview
            InvestmentSummary(investments = uiState.investmentSummary)
        }
    }
}

@Composable
fun DashboardFilters(
    dateRange: DateRange,
    onDateRangeChange: (DateRange) -> Unit,
    selectedCategories: List<String>,
    onCategorySelection: (String) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Advanced Filters",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Date Range Picker
            DateRangeSelector(
                startDate = dateRange.start,
                endDate = dateRange.end,
                onStartDateChange = { /* TODO */ },
                onEndDateChange = { /* TODO */ }
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Category Multi-select
            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                mainAxisSpacing = 8.dp,
                crossAxisSpacing = 8.dp
            ) {
                // Category chips would go here
            }
        }
    }
}
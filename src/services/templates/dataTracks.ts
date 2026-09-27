import { UserGoal } from '../../types';
import { LevelTemplate } from './types';

// AI / Machine Learning Engineer (6 Levels matching master-aiml-eng)
export function getAIMLEngineerLevels(goal?: UserGoal): LevelTemplate[] {
  return [
    {
      levelNumber: 1,
      title: 'Level 1 – Applied Mathematics & Vectorized Computing',
      description: 'Master linear algebra, multivariate calculus, matrix broadcasting with NumPy, and tensors.',
      assessmentTitle: 'Level 1 Assessment: Vectorized Math & Linear Algebra',
      topics: [
        {
          topic: 'NumPy Strides, Matrix Decompositions & Eigenvalues',
          explanation: 'Vectorized computing performs batch matrix multiplications in continuous memory buffers using BLAS/LAPACK backends.',
          objectives: ['Master multi-dimensional broadcasting and einsum', 'Compute SVD and eigenvalues for dimensionality reduction'],
          practice: {
            description: 'Implement cosine similarity between two 2D matrix embeddings using vectorized NumPy.',
            starterCode: `import numpy as np\ndef cosine_sim(a: np.ndarray, b: np.ndarray) -> np.ndarray:\n    dot = np.dot(a, b.T)\n    norm_a = np.linalg.norm(a, axis=1, keepdims=True)\n    norm_b = np.linalg.norm(b, axis=1, keepdims=True)\n    return dot / (norm_a * norm_b.T)`,
            expectedOutput: 'Vectorized cosine similarity matrix',
          },
          resources: [
            {
              id: 'r-ai-101',
              title: 'NumPy Array Programming Tutorial',
              provider: 'NumPy Documentation Team',
              topic: 'Vectorized Computing',
              duration: '25 min read',
              directUrl: 'https://numpy.org/doc/stable/user/quickstart.html',
              isVerified: true,
              selectionReason: 'Official documentation for vectorized array operations.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the mathematical role of Singular Value Decomposition (SVD) in machine learning?',
          options: [
            'It trains deep neural networks without weights.',
            'It factors a matrix into constituent orthogonal matrices and singular values, enabling optimal low-rank dimensionality reduction.',
            'It converts images into text files.',
            'It removes null values from SQL tables.',
          ],
          correctIndex: 1,
          explanation: 'SVD factorizes matrices into singular values and orthogonal vectors, providing the theoretical foundation for PCA and latent semantic indexing.',
          topic: 'Linear Algebra & SVD',
        },
      ],
    },
    {
      levelNumber: 2,
      title: 'Level 2 – Classical Machine Learning & Feature Engineering',
      description: 'Build predictive models with Scikit-Learn: gradient-boosted trees (XGBoost), hyperparameter tuning, and cross-validation.',
      assessmentTitle: 'Level 2 Assessment: Supervised Learning & Model Validation',
      topics: [
        {
          topic: 'Cross-Validation, Leakage Prevention & ROC-AUC Metrics',
          explanation: 'Data leakage inflates validation metrics. Preprocessing transformers must fit strictly on training folds within cross-validation loops.',
          objectives: ['Implement scikit-learn Pipelines with FeatureUnions', 'Evaluate models using Precision-Recall curves and ROC-AUC'],
          practice: {
            description: 'Build a Scikit-Learn Pipeline combining StandardScalar and a RandomForestClassifier.',
            starterCode: `from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.ensemble import RandomForestClassifier\n\npipe = Pipeline([\n    ('scaler', StandardScaler()),\n    ('rf', RandomForestClassifier(n_estimators=100, random_state=42))\n])`,
            expectedOutput: 'Fitted Scikit-Learn pipeline without leakage',
          },
          resources: [
            {
              id: 'r-ai-201',
              title: 'Scikit-Learn User Guide: Pipelines and Composite Estimators',
              provider: 'Scikit-Learn Community',
              topic: 'ML Pipelines',
              duration: '20 min read',
              directUrl: 'https://scikit-learn.org/stable/modules/compose.html',
              isVerified: true,
              selectionReason: 'Authoritative guide to leak-free feature pipelines and model validation.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'Why should feature scaling (like StandardScaler) be fitted only on training folds and not on the whole dataset before splitting?',
          options: [
            'Scikit-learn refuses to run otherwise.',
            'Fitting on test data causes data leakage, artificially inflating validation performance and leading to poor generalization in production.',
            'Scaling increases training time by 100x.',
            'It converts all numbers into zeros.',
          ],
          correctIndex: 1,
          explanation: 'Fitting scalers on validation or test sets leaks distribution statistics from the holdout data into the model training pipeline.',
          topic: 'Data Leakage & Cross-Validation',
        },
      ],
    },
    {
      levelNumber: 3,
      title: 'Level 3 – Deep Learning & PyTorch Architectures',
      description: 'Master backpropagation, PyTorch tensors, autograd computation graphs, CNNs, and custom Dataset/DataLoader pipelines.',
      assessmentTitle: 'Level 3 Assessment: PyTorch Tensors & Optimization',
      topics: [
        {
          topic: 'Autograd Graphs, Loss Functions & AdamW Optimization',
          explanation: 'PyTorch constructs dynamic Directed Acyclic Graphs (DAGs) during the forward pass, computing gradients via reverse-mode automatic differentiation.',
          objectives: ['Build custom nn.Module architectures with residual skips', 'Manage GPU memory allocations and mixed precision (AMP)'],
          practice: {
            description: 'Write a standard PyTorch training step with gradient zeroing, backward pass, and optimizer stepping.',
            starterCode: `import torch\ndef train_step(model, optimizer, criterion, inputs, targets):\n    optimizer.zero_grad()\n    outputs = model(inputs)\n    loss = criterion(outputs, targets)\n    loss.backward()\n    optimizer.step()\n    return loss.item()`,
            expectedOutput: 'Deterministic PyTorch backprop step',
          },
          resources: [
            {
              id: 'r-ai-301',
              title: 'PyTorch Tutorials: Deep Learning with PyTorch',
              provider: 'PyTorch Core Team',
              topic: 'PyTorch Autograd',
              duration: '30 min read',
              directUrl: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html',
              isVerified: true,
              selectionReason: 'Official PyTorch foundational tutorial for tensor math and neural networks.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'Why is optimizer.zero_grad() invoked before loss.backward() in standard PyTorch training loops?',
          options: [
            'It resets model weights to zero.',
            'PyTorch accumulates gradients by default; omitting zero_grad causes gradients from previous batches to sum up, distorting parameter updates.',
            'It clears CPU RAM.',
            'It compiles the graph into C++.',
          ],
          correctIndex: 1,
          explanation: 'Gradients accumulate across backward() calls by design (useful for RNNs or gradient accumulation); clearing them prevents gradient pollution.',
          topic: 'PyTorch Gradient Accumulation',
        },
      ],
    },
    {
      levelNumber: 4,
      title: 'Level 4 – Modern Generative AI & LLM Systems (RAG)',
      description: 'Architect Retrieval-Augmented Generation (RAG) systems, vector database indexing, embedding models, and prompt orchestration.',
      assessmentTitle: 'Level 4 Assessment: Vector Embeddings & RAG Architecture',
      topics: [
        {
          topic: 'Vector Stores, Embeddings & Chunking Strategies',
          explanation: 'RAG systems ground large language models with retrieved enterprise context, preventing hallucinations and keeping outputs grounded.',
          objectives: ['Design chunking pipelines with token overlap', 'Implement semantic search with vector embeddings and re-ranking'],
          practice: {
            description: 'Structure a semantic retrieval function scoring context chunks against a query embedding.',
            starterCode: `def retrieve_top_k(query_vec, doc_embeddings, docs, k=3):\n    # Calculate cosine similarity and return top k documents\n    import numpy as np\n    sims = np.dot(doc_embeddings, query_vec)\n    top_indices = np.argsort(sims)[::-1][:k]\n    return [docs[i] for i in top_indices]`,
            expectedOutput: 'Top-K semantic context chunks',
          },
          resources: [
            {
              id: 'r-ai-401',
              title: 'Hugging Face NLP Course: Retrieval and Vector Search',
              provider: 'Hugging Face',
              topic: 'Vector Embeddings',
              duration: '30 min read',
              directUrl: 'https://huggingface.co/learn/nlp-course/',
              isVerified: true,
              selectionReason: 'Practical authoritative curriculum on sentence transformers and embedding search.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In a Retrieval-Augmented Generation (RAG) pipeline, what is the purpose of re-ranking retrieved passages?',
          options: [
            'To translate passages into French.',
            'To apply a cross-encoder model to accurately re-score top candidate chunks from high-speed bi-encoder vector search before passing to the LLM context window.',
            'To compress text into zip format.',
            'To remove punctuation from documents.',
          ],
          correctIndex: 1,
          explanation: 'Bi-encoder vector search is fast but coarse; cross-encoder re-ranking scores full query-document interactions, ensuring the most relevant context is fed into the prompt.',
          topic: 'RAG Search Architecture',
        },
      ],
    },
    {
      levelNumber: 5,
      title: 'Level 5 – MLOps, Quantization & Production Inference',
      description: 'Deploy inference APIs with FastAPI and Triton, quantize weights (INT8/FP16), monitor model drift, and manage CI/CD.',
      assessmentTitle: 'Level 5 Assessment: Model Serving & Drift Monitoring',
      topics: [
        {
          topic: 'TensorRT / ONNX Runtime & Latency Benchmarks',
          explanation: 'Production model deployment requires converting PyTorch graphs to optimized ONNX/TensorRT runtimes with dynamic batching.',
          objectives: ['Quantize neural models to reduce latency and VRAM', 'Deploy containerized inference endpoints with health metrics'],
          practice: {
            description: 'Write an asynchronous inference route with batching in FastAPI.',
            starterCode: `from fastapi import FastAPI\nimport numpy as np\n\napp = FastAPI()\n\n@app.post("/predict")\nasync def predict(features: list[float]):\n    # Run model prediction on input vector\n    return {"prediction": float(np.sum(features) > 0)}`,
            expectedOutput: 'Low-latency inference API response',
          },
          resources: [
            {
              id: 'r-ai-501',
              title: 'FastAPI Machine Learning Serving Guide',
              provider: 'FastAPI Team',
              topic: 'Model Serving',
              duration: '20 min read',
              directUrl: 'https://fastapi.tiangolo.com/',
              isVerified: true,
              selectionReason: 'Industry standard asynchronous framework for low-latency machine learning serving.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the primary benefit of INT8 weight quantization for deployed deep learning models?',
          options: [
            'It increases the parameter count of the model.',
            'It decreases memory footprint by up to 4x and accelerates inference throughput with negligible loss in accuracy.',
            'It removes the need for any GPU hardware.',
            'It enables unsupervised training automatically.',
          ],
          correctIndex: 1,
          explanation: 'Quantizing weights from 32-bit floating point to 8-bit integers drastically reduces VRAM requirements and speeds up tensor arithmetic on modern accelerators.',
          topic: 'Model Quantization',
        },
      ],
    },
    {
      levelNumber: 6,
      title: 'Level 6 – AI Systems Capstone & Technical Screening',
      description: 'Ship an end-to-end production AI service, pass empirical ML system design interviews, and complete candidate verification.',
      assessmentTitle: 'Level 6 Assessment: AI Engineer Hiring Qualifying Bar',
      topics: [
        {
          topic: 'ML System Design: Recommendation, Search & LLM Safety',
          explanation: 'Industry machine learning engineering interviews focus on feedback loops, latency SLAs, offline vs online metrics, and safety guardrails.',
          objectives: ['Architect real-time recommendation engines', 'Defend model trade-offs under latency constraints'],
          practice: {
            description: 'Design the blueprint for a multimodal product search system handling 1,000 queries/sec.',
            starterCode: `// Architecture Blueprint:\n// 1. Text & Image Dual-Encoder (CLIP)\n// 2. Approximate Nearest Neighbor Index (HNSW / Milvus)\n// 3. Multi-task re-ranking model\n// 4. Fallback business filter rule engine`,
            expectedOutput: 'Full ML system design document',
          },
          resources: [
            {
              id: 'r-ai-601',
              title: 'Machine Learning System Design Interview Guide',
              provider: 'Applied ML Institute',
              topic: 'ML Systems Architecture',
              duration: '35 min read',
              directUrl: 'https://github.com/alirezadir/Machine-Learning-Interviews',
              isVerified: true,
              selectionReason: 'Comprehensive open-source collection of real-world ML engineering interview rubrics.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'When deploying a recommendation model, what metric best measures offline algorithmic ranking quality?',
          options: ['GPU temperature', 'Mean Reciprocal Rank (MRR) or NDCG@K', 'Network socket packet count', 'Lines of Python code'],
          correctIndex: 1,
          explanation: 'Normalized Discounted Cumulative Gain (NDCG) and Mean Reciprocal Rank (MRR) are the standard offline metrics evaluating ranked recommendation quality.',
          topic: 'Ranking Metrics Evaluation',
        },
      ],
    },
  ];
}

// Data Scientist (6 Levels matching master-data-sci)
export function getDataScienceLevels(goal?: UserGoal): LevelTemplate[] {
  return [
    {
      levelNumber: 1,
      title: 'Level 1 – Numerical Computing with NumPy & Pandas',
      description: 'Vectorized computing, broadcasting, missing data normalization, and multi-index aggregation.',
      assessmentTitle: 'Level 1 Assessment: Vectorized Data Wrangling',
      topics: [
        {
          topic: 'NumPy Memory Strides & Vectorization',
          explanation: 'Vectorized array computations operate in continuous C-memory buffers, achieving 100x speedup over Python loops.',
          objectives: ['Master broadcasting rules and multi-dimensional slicing', 'Avoid Python loops when operating on series'],
          practice: {
            description: 'Normalize an array by subtracting column means and dividing by standard deviations.',
            starterCode: `import numpy as np\ndef standardize(matrix: np.ndarray) -> np.ndarray:\n    mean = np.mean(matrix, axis=0)\n    std = np.std(matrix, axis=0)\n    return (matrix - mean) / np.where(std == 0, 1, std)`,
            expectedOutput: 'Standardized matrix with 0 mean and 1 variance',
          },
          resources: [
            {
              id: 'r-ds-101',
              title: 'NumPy Quickstart Guide',
              provider: 'NumPy Documentation Team',
              topic: 'Array Computing',
              duration: '25 min read',
              directUrl: 'https://numpy.org/doc/stable/user/quickstart.html',
              isVerified: true,
              selectionReason: 'Official documentation for vector broadcasting and numerical strides.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In NumPy broadcasting, when are two dimensions considered compatible?',
          options: [
            'When both dimensions are identical prime numbers.',
            'When they are equal, or one of them is 1.',
            'Only when both arrays have exact matching shapes.',
            'When the total element count is a power of 2.',
          ],
          correctIndex: 1,
          explanation: 'NumPy broadcasting matches trailing dimensions where values are either equal or one of them is 1.',
          topic: 'Array Broadcasting',
        },
      ],
    },
    {
      levelNumber: 2,
      title: 'Level 2 – Statistical Inference & Exploratory Analysis (EDA)',
      description: 'Hypothesis testing, p-values, confidence intervals, A/B testing design, and data distribution diagnostics.',
      assessmentTitle: 'Level 2 Assessment: Statistical Inference & Experiment Design',
      topics: [
        {
          topic: 'A/B Testing, P-values & Statistical Significance',
          explanation: 'Experimentation requires computing minimum detectable effects, sample size sizing, and controlling Type I & Type II errors.',
          objectives: ['Design randomized controlled experiments', 'Conduct two-sample t-tests and Chi-square independence tests'],
          practice: {
            description: 'Compute the pooled standard error and z-score for a conversion rate A/B test.',
            starterCode: `import math\ndef ab_test_z_score(c_conv, c_total, v_conv, v_total):\n    p_pool = (c_conv + v_conv) / (c_total + v_total)\n    se = math.sqrt(p_pool * (1 - p_pool) * (1/c_total + 1/v_total))\n    return (v_conv/v_total - c_conv/c_total) / se`,
            expectedOutput: 'Calculated z-score statistic',
          },
          resources: [
            {
              id: 'r-ds-201',
              title: 'Statistical Inference Course Material',
              provider: 'Penn State University Statistics',
              topic: 'Hypothesis Testing',
              duration: '30 min read',
              directUrl: 'https://online.stat.psu.edu/stat500/',
              isVerified: true,
              selectionReason: 'Rigorous open academic guide to experimental design and parametric tests.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What does a p-value of 0.03 indicate when testing a null hypothesis at significance level alpha = 0.05?',
          options: [
            'There is a 97% probability that the null hypothesis is true.',
            'Assuming the null hypothesis is true, there is a 3% probability of observing results as extreme as the sample data; reject null hypothesis.',
            'The experiment had bad sample data.',
            'The sample size was too large.',
          ],
          correctIndex: 1,
          explanation: 'A p-value measures probability under the null; since 0.03 < 0.05, we reject the null hypothesis in favor of the alternative.',
          topic: 'Hypothesis Testing P-Values',
        },
      ],
    },
    {
      levelNumber: 3,
      title: 'Level 3 – Applied Predictive Modeling & Regression',
      description: 'Supervised regression, logistic classification, regularization (L1 Lasso, L2 Ridge), and residual diagnostics.',
      assessmentTitle: 'Level 3 Assessment: Predictive Modeling & Regularization',
      topics: [
        {
          topic: 'Ordinary Least Squares & L1/L2 Regularization',
          explanation: 'Regularization penalizes high coefficient magnitudes, preventing overfitting and managing collinear feature spaces.',
          objectives: ['Apply Ridge and Lasso regression to prevent overfitting', 'Interpret odds ratios in logistic regression'],
          practice: {
            description: 'Train a Ridge regression model and inspect shrinkage coefficients.',
            starterCode: `from sklearn.linear_model import Ridge\ndef fit_ridge(X, y, alpha=1.0):\n    model = Ridge(alpha=alpha)\n    model.fit(X, y)\n    return model.coef_`,
            expectedOutput: 'Shrunk regression coefficients array',
          },
          resources: [
            {
              id: 'r-ds-301',
              title: 'Scikit-Learn Generalized Linear Models',
              provider: 'Scikit-Learn Community',
              topic: 'Linear Regression & Regularization',
              duration: '20 min read',
              directUrl: 'https://scikit-learn.org/stable/modules/linear_model.html',
              isVerified: true,
              selectionReason: 'Authoritative documentation for L1/L2 penalties and solver algorithms.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the primary difference between L1 (Lasso) and L2 (Ridge) regularization?',
          options: [
            'L1 regularization forces some feature coefficients to exactly zero, performing automatic feature selection; L2 shrinks coefficients toward zero without making them zero.',
            'L1 can only be used on images.',
            'L2 disables cross-validation.',
            'They produce identical coefficient values always.',
          ],
          correctIndex: 0,
          explanation: 'Lasso (L1) uses absolute penalty, producing sparse models by zeroing irrelevant coefficients; Ridge (L2) squares penalties, retaining all features with small weights.',
          topic: 'L1 vs L2 Regularization',
        },
      ],
    },
    {
      levelNumber: 4,
      title: 'Level 4 – Advanced Machine Learning & Tree Ensembles',
      description: 'Gradient Boosting (XGBoost, LightGBM), random forests, clustering (K-Means, DBSCAN), and dimensionality reduction.',
      assessmentTitle: 'Level 4 Assessment: Ensemble Methods & Unsupervised Learning',
      topics: [
        {
          topic: 'Gradient Boosting Mechanics & Tree Pruning',
          explanation: 'Gradient boosting trains sequential decision trees, each fitting the pseudo-residuals of the previous ensemble stage via gradient descent.',
          objectives: ['Tune learning_rate, max_depth, and subsample hyperparameters', 'Evaluate feature importances and SHAP values'],
          practice: {
            description: 'Write an XGBoost classifier with early stopping on validation loss.',
            starterCode: `from xgboost import XGBClassifier\nmodel = XGBClassifier(n_estimators=200, learning_rate=0.05, max_depth=5, early_stopping_rounds=10)`,
            expectedOutput: 'Trained XGBoost model with early stopping',
          },
          resources: [
            {
              id: 'r-ds-401',
              title: 'XGBoost Documentation: Introduction to Boosted Trees',
              provider: 'DMLC Team',
              topic: 'Gradient Boosting',
              duration: '25 min read',
              directUrl: 'https://xgboost.readthedocs.io/en/stable/tutorials/model.html',
              isVerified: true,
              selectionReason: 'Authoritative mathematical introduction to gradient boosting algorithms.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'How does Gradient Boosting differ from Random Forest bagging?',
          options: [
            'Random Forest builds trees sequentially; Gradient Boosting builds them in parallel.',
            'Random Forest builds independent trees in parallel and averages them; Gradient Boosting builds trees sequentially, each correcting the residual errors of prior trees.',
            'Gradient Boosting does not use decision trees.',
            'Random Forest is only for unsupervised clustering.',
          ],
          correctIndex: 1,
          explanation: 'Bagging (Random Forest) reduces variance by averaging independent trees; Boosting reduces bias by iteratively training weak learners on residual errors.',
          topic: 'Bagging vs Boosting Ensembles',
        },
      ],
    },
    {
      levelNumber: 5,
      title: 'Level 5 – Decision Intelligence & Business Metrics',
      description: 'Customer lifetime value (LTV), churn modeling, uplift modeling, causal inference, and executive dashboard communication.',
      assessmentTitle: 'Level 5 Assessment: Causal Inference & Business Modeling',
      topics: [
        {
          topic: 'Causal Inference & Retention Survival Analysis',
          explanation: 'Correlation does not imply causation. Propensity score matching and instrumental variables isolate true treatment effects from confounding variables.',
          objectives: ['Calculate Kaplan-Meier survival curves for customer churn', 'Apply propensity score matching to observational data'],
          practice: {
            description: 'Calculate customer retention rate across 30-day cohort cohorts.',
            starterCode: `def cohort_retention(active_users_m0, active_users_m1):\n    return round((active_users_m1 / active_users_m0) * 100, 2)`,
            expectedOutput: 'Calculated cohort retention percentage',
          },
          resources: [
            {
              id: 'r-ds-501',
              title: 'Causal Inference for The Brave and True',
              provider: 'Matheus Facure',
              topic: 'Causal Analysis',
              duration: '30 min read',
              directUrl: 'https://matheusfacure.github.io/python-causality-handbook/',
              isVerified: true,
              selectionReason: 'Comprehensive, python-first guide to modern econometric and causal inference techniques.',
              type: 'article',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'Why is an observational regression between price and sales often misleading without controlling for demand elasticity confounders?',
          options: [
            'Regression models cannot process numbers higher than 100.',
            'Confounders (like high seasonality or luxury branding) influence both higher prices and higher sales, causing positive bias in price coefficient estimates.',
            'Prices are always completely static.',
            'Observational data cannot be plotted.',
          ],
          correctIndex: 1,
          explanation: 'Omitted variable bias and confounding factors obscure the true negative price elasticity unless properly controlled or randomized.',
          topic: 'Confounding & Causal Modeling',
        },
      ],
    },
    {
      levelNumber: 6,
      title: 'Level 6 – Data Science Capstone & Technical Screening',
      description: 'Present an empirical business case defense, write production data transformation pipelines, and pass technical live rounds.',
      assessmentTitle: 'Level 6 Assessment: Data Science Candidate Qualifying Exam',
      topics: [
        {
          topic: 'Business Case Presentation & Live SQL/Python Defense',
          explanation: 'Lead data science loops test problem scoping, translating vague business requests into statistical objectives, and live SQL querying.',
          objectives: ['Structure business findings with clear executive narratives', 'Solve complex SQL window function and modeling problems live'],
          practice: {
            description: 'Write an executive summary interpreting a 4.2% churn reduction model.',
            starterCode: `// Executive Brief:\n// 1. Executive Summary & Estimated Financial Upside ($1.4M ARR)\n// 2. Model Performance (AUC 0.84, Precision@Top 10%: 42%)\n// 3. Recommended Intervention Triggers & A/B Rollout Plan`,
            expectedOutput: 'Executive data science presentation brief',
          },
          resources: [
            {
              id: 'r-ds-601',
              title: 'Data Science Interview Preparation Handbook',
              provider: 'ASCEND Data Science Board',
              topic: 'Interview Prep',
              duration: '25 min read',
              directUrl: 'https://docs.python.org/3/',
              isVerified: true,
              selectionReason: 'Standardized evaluation rubrics for lead data science candidate screening.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'When communicating statistical model results to non-technical executive stakeholders, what approach is most effective?',
          options: [
            'Present the exact mathematical loss function and gradient descent equations.',
            'Frame insights in terms of tangible business impact, expected revenue/cost changes, actionable recommendations, and risk confidence bounds.',
            'Refuse to answer questions about practical application.',
            'Only show raw code.',
          ],
          correctIndex: 1,
          explanation: 'Executives need clear decision intelligence: ROI, conversion impact, actionable steps, and confidence margins rather than implementation minutiae.',
          topic: 'Executive Communication',
        },
      ],
    },
  ];
}

// Data Analyst (5 Levels matching master-data-analyst)
export function getDataAnalystLevels(goal?: UserGoal): LevelTemplate[] {
  return [
    {
      levelNumber: 1,
      title: 'Level 1 – Advanced SQL for Business Analytics',
      description: 'Master window functions (ROW_NUMBER, RANK, DENSE_RANK), Common Table Expressions (CTEs), and aggregation rollups.',
      assessmentTitle: 'Level 1 Assessment: Relational Analytics & Window Functions',
      topics: [
        {
          topic: 'Window Functions: PARTITION BY & Running Totals',
          explanation: 'Window functions perform calculations across related row sets without collapsing rows into a single summary output.',
          objectives: [
            'Calculate month-over-month growth using LAG() and LEAD()',
            'Compute cumulative revenue running totals using SUM() OVER (PARTITION BY ... ORDER BY ...)',
          ],
          practice: {
            description: 'Write a query to calculate each customer\'s running total spend ordered by purchase date.',
            starterCode: `SELECT customer_id, order_date, amount,\n       SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) as running_total\nFROM orders;`,
            expectedOutput: 'Cumulative spend column per customer',
          },
          resources: [
            {
              id: 'r-da-101',
              title: 'PostgreSQL Tutorial: Window Functions',
              provider: 'PostgreSQL Global Development Group',
              topic: 'SQL Window Calculations',
              duration: '20 min read',
              directUrl: 'https://www.postgresql.org/docs/current/tutorial-window.html',
              isVerified: true,
              selectionReason: 'Direct authoritative PostgreSQL guide for analytical window functions.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the key difference between RANK() and DENSE_RANK() in SQL?',
          options: [
            'RANK() leaves gaps in ranking numbers after duplicate ties (e.g. 1, 2, 2, 4), while DENSE_RANK() does not leave gaps (e.g. 1, 2, 2, 3).',
            'DENSE_RANK() only works on floating point numbers.',
            'RANK() requires an INNER JOIN.',
            'They are exact identical aliases.',
          ],
          correctIndex: 0,
          explanation: 'RANK skips ranking numbers after ties; DENSE_RANK continues sequentially without gaps.',
          topic: 'SQL Ranking Functions',
        },
      ],
    },
    {
      levelNumber: 2,
      title: 'Level 2 – Complex Joins, CTEs & Aggregations',
      description: 'Build multi-step analytical pipelines using Common Table Expressions (WITH clauses), self-joins, and subquery filters.',
      assessmentTitle: 'Level 2 Assessment: CTE Pipelines & Complex Aggregations',
      topics: [
        {
          topic: 'Common Table Expressions (CTEs) & Chained Transforms',
          explanation: 'CTEs modularize complex SQL queries into readable, reusable temporary result sets that improve maintainability and execution planning.',
          objectives: ['Author recursive and chained CTEs', 'Optimize multi-table joins on large analytical tables'],
          practice: {
            description: 'Write a CTE that identifies top 5 customers per country by annual revenue.',
            starterCode: `WITH ranked_cust AS (\n  SELECT customer_id, country, SUM(total) as revenue,\n         DENSE_RANK() OVER (PARTITION BY country ORDER BY SUM(total) DESC) as rnk\n  FROM orders\n  GROUP BY customer_id, country\n)\nSELECT * FROM ranked_cust WHERE rnk <= 5;`,
            expectedOutput: 'Top 5 customers per country dataset',
          },
          resources: [
            {
              id: 'r-da-201',
              title: 'PostgreSQL Documentation: WITH Queries (Common Table Expressions)',
              provider: 'PostgreSQL Global Development Group',
              topic: 'SQL CTEs',
              duration: '20 min read',
              directUrl: 'https://www.postgresql.org/docs/current/queries-with.html',
              isVerified: true,
              selectionReason: 'Authoritative guide to structuring complex SQL workflows with WITH statements.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'Why are Common Table Expressions (CTEs) preferred over deeply nested subqueries in production analytics?',
          options: [
            'CTEs use less disk space on developer laptops.',
            'CTEs are read top-to-bottom sequentially, significantly improving query readability, debugging clarity, and maintainability.',
            'Nested subqueries are deprecated in SQL.',
            'CTEs cannot be used with PostgreSQL.',
          ],
          correctIndex: 1,
          explanation: 'CTEs organize data pipelines linearly, preventing unreadable nested parentheses and enabling cleaner query refactoring.',
          topic: 'SQL Query Readability',
        },
      ],
    },
    {
      levelNumber: 3,
      title: 'Level 3 – Business Intelligence & Dashboard Modeling',
      description: 'Design dimensional star schemas, fact tables, DAX measures, and interactive KPI dashboards in Tableau / PowerBI.',
      assessmentTitle: 'Level 3 Assessment: Dimensional Modeling & BI Metrics',
      topics: [
        {
          topic: 'Star Schema Design: Fact vs Dimension Tables',
          explanation: 'Dimensional modeling separates business events (fact tables like transactions) from context entities (dimension tables like customers, dates, and products).',
          objectives: ['Design dimensional schemas with surrogate keys', 'Formulate business KPIs (CAC, LTV, MRR, Churn)'],
          practice: {
            description: 'Design a dimensional model for an e-commerce platform with fact_orders and dim_product/dim_customer.',
            starterCode: `// Schema outline:\n// fact_sales (sale_id, customer_key, product_key, date_key, quantity, amount)\n// dim_customer (customer_key, name, tier, signup_date)\n// dim_product (product_key, sku, category, price)`,
            expectedOutput: 'Star schema architectural specification',
          },
          resources: [
            {
              id: 'r-da-301',
              title: 'The Data Warehouse Toolkit Summary',
              provider: 'Kimball Group',
              topic: 'Dimensional Modeling',
              duration: '25 min read',
              directUrl: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/',
              isVerified: true,
              selectionReason: 'The definitive industry standard methodology for star and snowflake schema design.',
              type: 'article',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'In a classic dimensional star schema, what is the core difference between a Fact table and a Dimension table?',
          options: [
            'Fact tables store numerical business metrics and foreign keys; Dimension tables store descriptive context attributes.',
            'Fact tables only contain text strings; Dimension tables contain binary images.',
            'There is no difference between them.',
            'Dimension tables cannot have primary keys.',
          ],
          correctIndex: 0,
          explanation: 'Fact tables record quantitative measurements of business events; dimension tables provide descriptive context for filtering and grouping.',
          topic: 'Star Schema Architecture',
        },
      ],
    },
    {
      levelNumber: 4,
      title: 'Level 4 – Python for Data Analysis (Pandas & Visualization)',
      description: 'Clean irregular datasets with Pandas, automate recurring business reports, and generate visualizations with Seaborn.',
      assessmentTitle: 'Level 4 Assessment: Pandas Wrangling & Data Automation',
      topics: [
        {
          topic: 'Pandas Groupby, Pivot Tables & Missing Data',
          explanation: 'Pandas provides high-performance data manipulation tools for restructuring messy business records, handling datetime offsets, and computing cohort tables.',
          objectives: ['Wrangle multi-index dataframes with pivot_table', 'Impute or interpolate missing time-series records'],
          practice: {
            description: 'Calculate monthly average order value per customer category using Pandas.',
            starterCode: `import pandas as pd\ndef calc_monthly_aov(df: pd.DataFrame) -> pd.DataFrame:\n    return df.groupby(['year_month', 'category'])['order_total'].mean().reset_index()`,
            expectedOutput: 'Monthly category AOV summary table',
          },
          resources: [
            {
              id: 'r-da-401',
              title: 'Pandas Documentation: Group by: split-apply-combine',
              provider: 'Pandas Development Team',
              topic: 'Data Aggregation in Python',
              duration: '20 min read',
              directUrl: 'https://pandas.pydata.org/docs/user_guide/groupby.html',
              isVerified: true,
              selectionReason: 'Official documentation for grouping, filtering, and transforming datasets.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'What is the purpose of reset_index() after executing a groupby() operation in Pandas?',
          options: [
            'It deletes all columns in the dataframe.',
            'It converts the grouped index hierarchy back into standard dataframe columns, simplifying downstream exports and joins.',
            'It randomizes the order of all rows.',
            'It converts the dataframe into an HTML string.',
          ],
          correctIndex: 1,
          explanation: 'reset_index() flattens hierarchical multi-indexes back into regular columns, making the data easier to manipulate and export.',
          topic: 'Pandas Index Management',
        },
      ],
    },
    {
      levelNumber: 5,
      title: 'Level 5 – Business Case Studies & Technical Interview Screening',
      description: 'Defend real-world business case analyses, answer live SQL technical questions, and present executive metrics.',
      assessmentTitle: 'Level 5 Assessment: Data Analyst Hiring Qualifying Exam',
      topics: [
        {
          topic: 'Live SQL Coding & Root Cause Analysis',
          explanation: 'Hiring panels for data analysts assess root cause investigation speed (e.g. "Why did checkout conversions drop 12% on Tuesday?") and live SQL accuracy.',
          objectives: ['Deconstruct sudden metric anomalies systematically', 'Pass live SQL screening rounds with complex joins and partitions'],
          practice: {
            description: 'Write an analytical plan investigating a sudden 15% revenue drop in an e-commerce platform.',
            starterCode: `// Root Cause Investigation Sequence:\n// 1. Segment revenue drop by channel (Mobile vs Web, Geography, Payment method)\n// 2. Inspect funnel conversion stages (Cart -> Checkout -> Payment Success)\n// 3. Verify external factors (Marketing pause, holiday seasonality, 3rd party gateway outage)`,
            expectedOutput: 'Structured root cause diagnostic playbook',
          },
          resources: [
            {
              id: 'r-da-501',
              title: 'Data Analyst Interview Guide & Case Study Frameworks',
              provider: 'ASCEND Analytics Faculty',
              topic: 'Analytics Interviews',
              duration: '30 min read',
              directUrl: 'https://www.postgresql.org/docs/current/',
              isVerified: true,
              selectionReason: 'Standardized analytical frameworks used in technical interviews for data analysts.',
              type: 'documentation',
            },
          ],
        },
      ],
      questions: [
        {
          question: 'When investigating a sudden 15% drop in total daily revenue, what is the best first analytical step?',
          options: [
            'Immediately rewrite all database queries from scratch.',
            'Segment the metric across dimensions (device type, geography, payment gateway, traffic source) to isolate whether the drop is isolated or platform-wide.',
            'Assume the analytics tracking script is permanently broken and do nothing.',
            'Send an apology email to all registered users.',
          ],
          correctIndex: 1,
          explanation: 'Dimension segmentation isolates the root failure domain (e.g. specific payment provider outage vs marketing channel shutoff) before jumping to conclusions.',
          topic: 'Root Cause Analysis Methodology',
        },
      ],
    },
  ];
}
